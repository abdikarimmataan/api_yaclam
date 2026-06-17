const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Purchase = require("../models/purchase.model");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");
const {
  syncCourseEnrollmentCount,
  getEnrollmentCount,
  getEnrollmentCounts,
} = require("../utilities/course-stats.utility");

module.exports = {
  create: async (req, res) => {
    try {
      const { studentID, courseId, transactionID = null } = req.body;

      if (!isValidObjectId(studentID)) {
        return Response.errorResponse(res, 400, { message: "studentID must be a valid id" });
      }
      if (!isValidObjectId(courseId)) {
        return Response.errorResponse(res, 400, { message: "courseId must be a valid id" });
      }

      const student = await User.findOne({ _id: studentID, del_status: "Live" });
      if (!student) {
        return Response.customResponse(res, 404, "Student not found");
      }

      const course = await Course.findOne({ _id: courseId, del_status: "Live" });
      if (!course) {
        return Response.customResponse(res, 404, "Course not found");
      }

      const existing = await Purchase.findOne({
        studentID,
        courseId,
        del_status: "Live",
      });
      if (existing) {
        return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      }

      const purchase = new Purchase({
        studentID,
        courseId,
        transactionID: transactionID || null,
      });
      const saved = await purchase.save();

      await syncCourseEnrollmentCount(courseId);

      const populated = await Purchase.findById(saved._id)
        .populate("studentID", "email profile.full_name profile.avatar_url accountType")
        .populate("courseId", "title thumbnail price isFree instructorName");

      return Response.successResponse(res, 201, populated);
    } catch (err) {
      if (err?.code === 11000) {
        return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      }
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = { del_status: "Live" };

      const total = await Purchase.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await Purchase.find(filter)
        .populate("studentID", "email profile.full_name profile.avatar_url accountType")
        .populate("courseId", "title thumbnail price isFree instructorName")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      if (!pagination.data || pagination.data.length === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      return Response.paginationResponse(res, 200, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getstudentIDbyCourses: async (req, res) => {
    try {
      const { studentId } = req.params;
      if (!isValidObjectId(studentId)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const student = await User.findOne({ _id: studentId, del_status: "Live" });
      if (!student) {
        return Response.customResponse(res, 404, "Student not found");
      }

      const filter = { studentID: studentId, del_status: "Live" };
      const total = await Purchase.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await Purchase.find(filter)
        .populate("courseId", "title thumbnail price isFree instructorName level duration category")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      if (!pagination.data || pagination.data.length === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      return Response.paginationResponse(res, 200, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getMyCourses: async (req, res) => {
    try {
      if (req.user.accountType !== "student") {
        return Response.customResponse(res, 403, "Only students can view purchased courses");
      }

      const studentId = req.user.userId;
      const filter = { studentID: studentId, del_status: "Live" };
      const total = await Purchase.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await Purchase.find(filter)
        .populate(
          "courseId",
          "title thumbnail price isFree instructorName level duration category originalPrice badge color"
        )
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      if (!pagination.data || pagination.data.length === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      return Response.paginationResponse(res, 200, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  enrollFree: async (req, res) => {
    try {
      if (req.user.accountType !== "student") {
        return Response.customResponse(res, 403, "Only students can enroll in courses");
      }

      const studentId = req.user.userId;
      const { courseId } = req.body;

      if (!isValidObjectId(courseId)) {
        return Response.errorResponse(res, 400, { message: "courseId must be a valid id" });
      }

      const course = await Course.findOne({
        _id: courseId,
        del_status: "Live",
        isFree: true,
      });
      if (!course) {
        return Response.customResponse(res, 404, "Free course not found");
      }

      const existing = await Purchase.findOne({
        studentID: studentId,
        courseId,
        del_status: "Live",
      });
      if (existing) {
        const populated = await Purchase.findById(existing._id).populate(
          "courseId",
          "title thumbnail price isFree instructorName level duration category"
        );
        return Response.successResponse(res, 200, populated);
      }

      const purchase = await Purchase.create({
        studentID: studentId,
        courseId,
        transactionID: null,
      });

      await syncCourseEnrollmentCount(courseId);

      const populated = await Purchase.findById(purchase._id).populate(
        "courseId",
        "title thumbnail price isFree instructorName level duration category"
      );

      return Response.successResponse(res, 201, populated);
    } catch (err) {
      if (err?.code === 11000) {
        return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      }
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getEnrollmentCount: async (req, res) => {
    try {
      const { courseId } = req.params;
      if (!isValidObjectId(courseId)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOne({ _id: courseId, del_status: "Live" }).select("_id");
      if (!course) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      const count = await getEnrollmentCount(courseId);
      return Response.successResponse(res, 200, { courseId, count });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getEnrollmentCounts: async (req, res) => {
    try {
      const raw = String(req.query.ids ?? "").trim();
      const ids = raw
        .split(",")
        .map((id) => id.trim())
        .filter((id) => isValidObjectId(id));

      if (!ids.length) {
        return Response.successResponse(res, 200, { counts: {} });
      }

      const counts = await getEnrollmentCounts(ids);
      return Response.successResponse(res, 200, { counts });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
