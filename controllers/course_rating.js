const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Course = require("../models/course.model");
const CourseRating = require("../models/course_rating.model");
const Purchase = require("../models/purchase.model");
const User = require("../models/user.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const { syncCourseRating, normalizeRatingValue } = require("../utilities/course-rating.utility");

async function studentEnrolled(studentId, courseId) {
  const purchase = await Purchase.findOne({
    studentID: studentId,
    courseId,
    del_status: "Live",
  });
  return Boolean(purchase);
}

module.exports = {
  getByCourse: async (req, res) => {
    try {
      const { courseId } = req.params;
      if (!isValidObjectId(courseId)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOne({ _id: courseId, del_status: "Live" }).select("title");
      if (!course) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      const ratings = await CourseRating.find({ courseId, del_status: "Live" })
        .populate("studentID", "profile.full_name profile.avatar_url")
        .sort({ created_at: -1 })
        .lean();

      const reviewCount = ratings.length;
      const rating = reviewCount
        ? Math.round(
            (ratings.reduce((sum, row) => sum + normalizeRatingValue(row.rating), 0) / reviewCount) * 10
          ) / 10
        : 0;

      return Response.successResponse(res, 200, {
        courseId,
        rating,
        reviewCount,
        ratings: ratings.map((row) => ({
          id: row._id?.toString(),
          rating: normalizeRatingValue(row.rating),
          text: row.text || "",
          created_at: row.created_at,
          studentName: row.studentID?.profile?.full_name?.trim() || "Student",
          studentAvatar: row.studentID?.profile?.avatar_url?.trim() || "",
        })),
      });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getByCourses: async (req, res) => {
    try {
      const raw = String(req.query.ids ?? "").trim();
      const ids = raw
        .split(",")
        .map((id) => id.trim())
        .filter((id) => isValidObjectId(id));

      if (!ids.length) {
        return Response.successResponse(res, 200, { courses: {} });
      }

      const ratings = await CourseRating.find({
        courseId: { $in: ids },
        del_status: "Live",
      })
        .select("courseId rating")
        .lean();

      const courses = {};
      ids.forEach((id) => {
        courses[id] = { courseId: id, rating: 0, reviewCount: 0 };
      });

      const grouped = {};
      ratings.forEach((row) => {
        const key = String(row.courseId);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(normalizeRatingValue(row.rating));
      });

      Object.entries(grouped).forEach(([courseId, values]) => {
        const reviewCount = values.length;
        const rating = reviewCount
          ? Math.round((values.reduce((sum, value) => sum + value, 0) / reviewCount) * 10) / 10
          : 0;
        courses[courseId] = { courseId, rating, reviewCount };
      });

      return Response.successResponse(res, 200, { courses });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getMine: async (req, res) => {
    try {
      if (req.user.accountType !== "student") {
        return Response.customResponse(res, 403, "Only students can view their rating");
      }

      const { courseId } = req.params;
      if (!isValidObjectId(courseId)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const rating = await CourseRating.findOne({
        studentID: req.user.userId,
        courseId,
        del_status: "Live",
      });
      if (!rating) {
        return Response.successResponse(res, 200, null);
      }
      const payload = rating.toObject();
      payload.rating = normalizeRatingValue(payload.rating);
      return Response.successResponse(res, 200, payload);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  create: async (req, res) => {
    try {
      if (req.user.accountType !== "student") {
        return Response.customResponse(res, 403, "Only students can rate courses");
      }

      const studentId = req.user.userId;
      const { courseId, rating, text = "" } = req.body;

      if (!isValidObjectId(courseId)) {
        return Response.errorResponse(res, 400, { message: "courseId must be a valid id" });
      }

      const course = await Course.findOne({ _id: courseId, del_status: "Live" });
      if (!course) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      const enrolled = await studentEnrolled(studentId, courseId);
      if (!enrolled) {
        return Response.customResponse(res, 403, "You must purchase this course before rating it");
      }

      const student = await User.findOne({ _id: studentId, del_status: "Live", accountType: "student" });
      if (!student) {
        return Response.customResponse(res, 403, ResponseMessage.ACCESS_DENIED);
      }

      const existing = await CourseRating.findOne({ studentID: studentId, courseId, del_status: "Live" });
      let saved;

      if (existing) {
        existing.rating = rating;
        existing.text = String(text ?? "").trim();
        saved = await existing.save();
      } else {
        saved = await CourseRating.create({
          studentID: studentId,
          courseId,
          rating,
          text: String(text ?? "").trim(),
        });
      }

      const stats = await syncCourseRating(courseId);
      return Response.successResponse(res, existing ? 200 : 201, {
        rating: saved,
        courseRating: stats.avg,
        reviewCount: stats.count,
      });
    } catch (err) {
      if (err?.code === 11000) {
        return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      }
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
