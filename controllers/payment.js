const axios = require("axios");
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Transaction = require("../models/transaction.model");
const TransactionLog = require("../models/transactionLog.model");
const Purchase = require("../models/purchase.model");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const Response = require("../utilities/reponse.utility");
const PaginationUtility = require("../utilities/pagination_utility");
const WaafiPay = require("../utilities/waafipay.utility");
const { syncCourseEnrollmentCount } = require("../utilities/course-stats.utility");

async function ensureStudentExists(studentId) {
  if (!isValidObjectId(studentId)) {
    return { ok: false, status: 400, msg: "Invalid studentId format" };
  }
  const student = await User.findOne({
    _id: studentId,
    accountType: "student",
    del_status: "Live",
  });
  if (!student) return { ok: false, status: 404, msg: "Student not found" };
  return { ok: true, student };
}

async function ensureCourseExists(courseId) {
  if (!isValidObjectId(courseId)) {
    return { ok: false, status: 400, msg: "Invalid courseId format" };
  }
  const course = await Course.findOne({
    _id: courseId,
    del_status: "Live",
    isVisible: { $ne: false },
    isPublished: { $ne: false },
    status: { $ne: false },
  });
  if (!course) return { ok: false, status: 404, msg: "Course not found" };
  return { ok: true, course };
}

async function logTransactionAttempt({
  phone,
  studentId,
  courseId,
  description,
  status,
  data,
  amount,
  referenceId,
  invoiceId,
  transactionId,
}) {
  try {
    return await TransactionLog.create({
      phone,
      studentId,
      courseId,
      description,
      status,
      responseCode: data?.responseCode,
      state: data?.params?.state,
      transactionId: transactionId ?? (data?.params?.transactionId || data?.transactionId),
      referenceId,
      invoiceId,
      amount,
      rawResponse: data ?? null,
    });
  } catch (e) {
    console.error("TransactionLog save failed:", e?.message || e);
    return null;
  }
}

module.exports = {
  pay: async (req, res) => {
    try {
      const studentId = req.user.userId;
      const { phone, courseId } = req.body;

      if (req.user.accountType !== "student") {
        return Response.customResponse(res, 403, "Only students can purchase courses");
      }

      if (!process.env.WAAFIPAY_MERCHANT_UID || !process.env.WAAFIPAY_API_KEY || !process.env.WAAFIPAY_API_USER_ID) {
        return Response.customResponse(res, 500, "WaafiPay credentials are not configured");
      }

      const studentCheck = await ensureStudentExists(studentId);
      if (!studentCheck.ok) {
        await logTransactionAttempt({
          phone,
          studentId,
          courseId,
          description: studentCheck.msg,
          status: "error",
          data: null,
        });
        return Response.customResponse(res, studentCheck.status, studentCheck.msg);
      }

      const courseCheck = await ensureCourseExists(courseId);
      if (!courseCheck.ok) {
        await logTransactionAttempt({
          phone,
          studentId,
          courseId,
          description: courseCheck.msg,
          status: "error",
          data: null,
        });
        return Response.customResponse(res, courseCheck.status, courseCheck.msg);
      }
      const course = courseCheck.course;

      if (course.isFree === true) {
        return Response.customResponse(res, 400, "This course is free. Use enroll instead.");
      }

      const existingPurchase = await Purchase.findOne({
        studentID: studentId,
        courseId,
        del_status: "Live",
      });
      if (existingPurchase) {
        return Response.customResponse(res, 409, "You already own this course");
      }

      const norm = WaafiPay.normalizeSomMobile(phone);
      if (!norm.ok) {
        await logTransactionAttempt({
          phone,
          studentId,
          courseId,
          description: `Invalid phone: ${norm.error}`,
          status: "error",
          data: null,
        });
        return Response.customResponse(res, 400, norm.error);
      }

      const amount = WaafiPay.truncateAmount(course.price);
      if (amount === null) {
        await logTransactionAttempt({
          phone,
          studentId,
          courseId,
          description: "Invalid course price for payment",
          status: "error",
          data: null,
          amount: course.price,
        });
        return Response.customResponse(res, 400, "Invalid course price for payment.");
      }

      const courseInfo = {
        title: course.title,
        price: amount,
        originalPrice: Number(course.originalPrice) || null,
        instructorName: course.instructorName || course.instructor?.name || "",
        thumbnail: course.thumbnail || "",
      };

      const { payload, referenceId, invoiceId } = WaafiPay.buildPurchasePayload({
        course,
        accountNo: norm.accountNo,
        amount,
      });

      const paymentResponse = await axios.post(WaafiPay.gatewayUrl(), payload, {
        headers: { "Content-Type": "application/json" },
      });
      const data = paymentResponse.data;

      const parsed = WaafiPay.parseApprovedPayment(data);
      if (!parsed.ok) {
        await logTransactionAttempt({
          phone,
          studentId,
          courseId,
          description: parsed.message,
          status: "error",
          data: parsed.data,
          amount,
          referenceId,
          invoiceId,
        });
        return Response.customResponse(res, 400, parsed.message);
      }

      const finalAmount = parsed.chargedAmount ?? amount;
      const successLog = await logTransactionAttempt({
        phone,
        studentId,
        courseId,
        description: parsed.state,
        status: "success",
        data: parsed.data,
        amount: finalAmount,
        referenceId,
        invoiceId,
        transactionId: parsed.transactionId,
      });

      if (!successLog?._id) {
        return Response.errorResponse(res, 500, "Failed to write transaction log; payment not recorded.");
      }

      const transaction = new Transaction({
        transactionId: parsed.transactionId,
        phone,
        amount: finalAmount,
        courseId,
        studentId,
        transactionLogId: successLog._id,
        courseInfo,
        date: new Date(),
      });
      const savedTransaction = await transaction.save();

      let purchase = await Purchase.findOne({ studentID: studentId, courseId, del_status: "Live" });
      if (!purchase) {
        purchase = await Purchase.create({
          studentID: studentId,
          courseId,
          transactionID: parsed.transactionId,
        });
        await syncCourseEnrollmentCount(courseId);
      }

      const populatedPurchase = await Purchase.findById(purchase._id)
        .populate("courseId", "title thumbnail price isFree instructorName level duration category")
        .populate("studentID", "email profile.full_name profile.avatar_url");

      return Response.successResponse(res, 200, {
        message: "Payment successful. Please confirm on your phone if prompted.",
        transactionId: parsed.transactionId,
        amount: finalAmount,
        referenceId,
        transaction: savedTransaction,
        purchase: populatedPurchase,
      });
    } catch (err) {
      const data = err?.response?.data;
      const gatewayMsg = data
        ? WaafiPay.waafiResponseMessage(data)
        : err?.message || "Unknown error";

      await logTransactionAttempt({
        phone: req.body?.phone || "",
        studentId: req.user?.userId || null,
        courseId: req.body?.courseId || null,
        description: `Gateway error: ${gatewayMsg}`,
        status: "error",
        data,
      });

      console.error("WAAFIPAY ERROR:", data || err.message || err);
      return Response.errorResponse(res, 500, gatewayMsg);
    }
  },

  getMyTransactions: async (req, res) => {
    try {
      const studentId = req.user.userId;
      if (req.user.accountType !== "student") {
        return Response.customResponse(res, 403, "Only students can view their transactions");
      }

      const filter = { studentId, del_status: "Live" };
      const total = await Transaction.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) {
        return Response.customResponse(res, 200, "No Data Found");
      }

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, "Out of data");
      }

      pagination.data = await Transaction.find(filter)
        .populate("courseId", "title thumbnail price instructorName")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      return Response.paginationResponse(res, 200, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
