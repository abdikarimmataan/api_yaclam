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
const StripeUtil = require("../utilities/stripe.utility");
const { syncCourseEnrollmentCount } = require("../utilities/course-stats.utility");

function isWaafiPayConfigured() {
  return Boolean(
    process.env.WAAFIPAY_MERCHANT_UID &&
      process.env.WAAFIPAY_API_KEY &&
      process.env.WAAFIPAY_API_USER_ID
  );
}

async function finalizeSuccessfulPurchase({
  studentId,
  courseId,
  course,
  amount,
  transactionId,
  phone,
  description,
  rawResponse,
  referenceId,
  invoiceId,
}) {
  const courseInfo = {
    title: course.title,
    price: amount,
    originalPrice: Number(course.originalPrice) || null,
    instructorName: course.instructorName || course.instructor?.name || "",
    thumbnail: course.thumbnail || "",
  };

  const successLog = await logTransactionAttempt({
    phone,
    studentId,
    courseId,
    description,
    status: "success",
    data: rawResponse,
    amount,
    referenceId,
    invoiceId,
    transactionId,
  });

  if (!successLog?._id) {
    return { ok: false, status: 500, msg: "Failed to write transaction log; payment not recorded." };
  }

  const transaction = new Transaction({
    transactionId,
    phone,
    amount,
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
      transactionID: transactionId,
    });
    await syncCourseEnrollmentCount(courseId);
  }

  const populatedPurchase = await Purchase.findById(purchase._id)
    .populate("courseId", "title thumbnail price isFree instructorName level duration category slug")
    .populate("studentID", "email profile.full_name profile.avatar_url");

  return {
    ok: true,
    transactionId,
    amount,
    referenceId,
    transaction: savedTransaction,
    purchase: populatedPurchase,
  };
}

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
      const finalized = await finalizeSuccessfulPurchase({
        studentId,
        courseId,
        course,
        amount: finalAmount,
        transactionId: parsed.transactionId,
        phone,
        description: parsed.state,
        rawResponse: parsed.data,
        referenceId,
        invoiceId,
      });

      if (!finalized.ok) {
        return Response.errorResponse(res, finalized.status, finalized.msg);
      }

      return Response.successResponse(res, 200, {
        message: "Payment successful. Please confirm on your phone if prompted.",
        transactionId: finalized.transactionId,
        amount: finalized.amount,
        referenceId: finalized.referenceId,
        transaction: finalized.transaction,
        purchase: finalized.purchase,
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

  getMethods: async (req, res) => {
    try {
      const methods = [];

      if (isWaafiPayConfigured()) {
        methods.push({
          id: "waafipay",
          label: "WaafiPay",
          description: "Pay with EVC Plus or Zaad mobile money",
        });
      }

      if (StripeUtil.isConfigured()) {
        methods.push({
          id: "stripe",
          label: "Card",
          description: "Pay securely with Mastercard or Visa",
        });
      }

      return Response.successResponse(res, 200, {
        methods,
        stripePublicKey: StripeUtil.isConfigured() ? StripeUtil.getPublicKey() : null,
      });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  createStripeIntent: async (req, res) => {
    try {
      const studentId = req.user.userId;
      const { courseId } = req.body;

      if (req.user.accountType !== "student") {
        return Response.customResponse(res, 403, "Only students can purchase courses");
      }

      if (!StripeUtil.isConfigured()) {
        return Response.customResponse(res, 500, "Stripe is not configured");
      }

      const studentCheck = await ensureStudentExists(studentId);
      if (!studentCheck.ok) {
        return Response.customResponse(res, studentCheck.status, studentCheck.msg);
      }

      const courseCheck = await ensureCourseExists(courseId);
      if (!courseCheck.ok) {
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

      const amount = StripeUtil.truncateAmount(course.price);
      if (amount === null) {
        return Response.customResponse(res, 400, "Invalid course price for payment.");
      }

      const stripe = StripeUtil.getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: (process.env.WAAFIPAY_CURRENCY || "usd").toLowerCase(),
        payment_method_types: ["card"],
        metadata: {
          studentId: String(studentId),
          courseId: String(courseId),
          courseTitle: course.title || "",
        },
      });

      return Response.successResponse(res, 200, {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (err) {
      console.error("STRIPE INTENT ERROR:", err.message || err);
      return Response.errorResponse(res, 500, err.message || "Failed to start card payment");
    }
  },

  createStripeCheckout: async (req, res) => {
    try {
      const studentId = req.user.userId;
      const { courseId, cancelUrl } = req.body;

      if (req.user.accountType !== "student") {
        return Response.customResponse(res, 403, "Only students can purchase courses");
      }

      if (!StripeUtil.isConfigured()) {
        return Response.customResponse(res, 500, "Stripe is not configured");
      }

      const studentCheck = await ensureStudentExists(studentId);
      if (!studentCheck.ok) {
        return Response.customResponse(res, studentCheck.status, studentCheck.msg);
      }

      const courseCheck = await ensureCourseExists(courseId);
      if (!courseCheck.ok) {
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

      const amount = StripeUtil.truncateAmount(course.price);
      if (amount === null) {
        return Response.customResponse(res, 400, "Invalid course price for payment.");
      }

      const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
      const safeCancelUrl =
        typeof cancelUrl === "string" && cancelUrl.startsWith(frontendUrl)
          ? cancelUrl
          : frontendUrl;

      const stripe = StripeUtil.getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: (process.env.WAAFIPAY_CURRENCY || "usd").toLowerCase(),
              product_data: {
                name: course.title,
                description: course.instructorName || undefined,
                images: course.thumbnail ? [course.thumbnail] : undefined,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          studentId: String(studentId),
          courseId: String(courseId),
        },
        success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: safeCancelUrl,
      });

      return Response.successResponse(res, 200, {
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    } catch (err) {
      console.error("STRIPE CHECKOUT ERROR:", err.message || err);
      return Response.errorResponse(res, 500, err.message || "Failed to start card checkout");
    }
  },

  confirmStripeCheckout: async (req, res) => {
    try {
      const studentId = req.user.userId;
      const { sessionId, paymentIntentId } = req.body;

      if (req.user.accountType !== "student") {
        return Response.customResponse(res, 403, "Only students can purchase courses");
      }

      if (!StripeUtil.isConfigured()) {
        return Response.customResponse(res, 500, "Stripe is not configured");
      }

      const stripe = StripeUtil.getStripe();
      let courseId;
      let amount;
      let transactionId;
      let phone = "stripe-card";
      let rawResponse;
      let referenceId;

      if (paymentIntentId) {
        rawResponse = await StripeUtil.fetchStripePaymentLogData(stripe, { paymentIntentId });
        const paymentIntent = rawResponse?.paymentIntent;
        if (!paymentIntent || paymentIntent.status !== "succeeded") {
          return Response.customResponse(res, 400, "Payment is not completed yet");
        }
        if (String(paymentIntent.metadata?.studentId) !== String(studentId)) {
          return Response.customResponse(res, 403, "This payment does not belong to your account");
        }
        courseId = paymentIntent.metadata?.courseId;
        amount = StripeUtil.truncateAmount(
          (paymentIntent.amount_received || paymentIntent.amount || 0) / 100
        );
        transactionId = String(paymentIntent.id);
        referenceId = paymentIntent.id;
      } else {
        rawResponse = await StripeUtil.fetchStripePaymentLogData(stripe, { sessionId });
        const session = rawResponse?.checkoutSession;

        if (!session || session.payment_status !== "paid") {
          return Response.customResponse(res, 400, "Payment is not completed yet");
        }

        if (String(session.metadata?.studentId) !== String(studentId)) {
          return Response.customResponse(res, 403, "This payment does not belong to your account");
        }

        courseId = session.metadata?.courseId;
        amount = StripeUtil.truncateAmount((session.amount_total || 0) / 100);
        transactionId = String(session.payment_intent?.id || session.payment_intent || session.id);
        phone = session.customer_details?.email || "stripe-card";
        referenceId = session.id;
      }

      const courseCheck = await ensureCourseExists(courseId);
      if (!courseCheck.ok) {
        return Response.customResponse(res, courseCheck.status, courseCheck.msg);
      }
      const course = courseCheck.course;

      const existingPurchase = await Purchase.findOne({
        studentID: studentId,
        courseId,
        del_status: "Live",
      });
      if (existingPurchase) {
        const populatedPurchase = await Purchase.findById(existingPurchase._id)
          .populate("courseId", "title thumbnail price isFree instructorName level duration category slug")
          .populate("studentID", "email profile.full_name profile.avatar_url");
        return Response.successResponse(res, 200, {
          message: "You already own this course",
          transactionId: existingPurchase.transactionID || transactionId,
          purchase: populatedPurchase,
        });
      }

      const finalized = await finalizeSuccessfulPurchase({
        studentId,
        courseId,
        course,
        amount,
        transactionId,
        phone,
        description: "Stripe card payment",
        rawResponse,
        referenceId,
        invoiceId: undefined,
      });

      if (!finalized.ok) {
        return Response.errorResponse(res, finalized.status, finalized.msg);
      }

      return Response.successResponse(res, 200, {
        message: "Payment successful. You can start learning now.",
        transactionId: finalized.transactionId,
        amount: finalized.amount,
        referenceId: finalized.referenceId,
        transaction: finalized.transaction,
        purchase: finalized.purchase,
      });
    } catch (err) {
      console.error("STRIPE CONFIRM ERROR:", err.message || err);
      return Response.errorResponse(res, 500, err.message || "Failed to confirm card payment");
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
