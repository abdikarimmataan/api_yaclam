const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Course = require("../models/course.model");
const Instructor = require("../models/instructor.model");
const Purchase = require("../models/purchase.model");
const CourseRating = require("../models/course_rating.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

function instructorObjectId(req) {
  const id = req.user?.userId;
  if (!id || !isValidObjectId(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

function ownershipFilter(instructorId) {
  return {
    del_status: "Live",
    $or: [{ "instructor.instructorId": instructorId }, { instructorId }],
  };
}

async function loadInstructorProfile(instructorId) {
  return Instructor.findOne({ _id: instructorId, del_status: "Live" }).select("name photo bio");
}

module.exports = {
  injectInstructorBody: async (req, res, next) => {
    try {
      const instructorId = instructorObjectId(req);
      if (!instructorId) {
        return Response.errorResponse(res, 401, { message: "Invalid instructor token" });
      }

      const profile = await loadInstructorProfile(instructorId);
      if (!profile) {
        return Response.customResponse(res, 403, "Instructor account not found");
      }

      const existing =
        req.body.instructor && typeof req.body.instructor === "object" ? req.body.instructor : {};

      req.body.instructor = {
        ...existing,
        instructorId: instructorId.toString(),
        name: existing.name || profile.name || "",
        role: existing.role || "Practitioner-instructor",
        bio: existing.bio || profile.bio || "",
        avatar: existing.avatar || profile.photo || "",
      };
      req.body.instructorId = instructorId.toString();
      req.body.instructorName = req.body.instructor.name;

      next();
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  assertOwnCourse: async (req, res, next) => {
    try {
      const instructorId = instructorObjectId(req);
      if (!instructorId) {
        return Response.errorResponse(res, 401, { message: "Invalid instructor token" });
      }

      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOne({ _id: id, ...ownershipFilter(instructorId) });
      if (!course) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      req.ownedCourse = course;
      next();
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const instructorId = instructorObjectId(req);
      if (!instructorId) {
        return Response.errorResponse(res, 401, { message: "Invalid instructor token" });
      }

      const filter = ownershipFilter(instructorId);
      if (req.query.isFree === "true") filter.isFree = true;
      if (req.query.isFeatured === "true") filter.isFeatured = true;
      if (req.query.category) filter.category = req.query.category;

      const total = await Course.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await Course.find(filter)
        .populate("fieldId", "name icon")
        .populate("instructor.instructorId", "name email photo")
        .sort({ sortOrder: 1, created_at: -1 })
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

  getById: async (req, res) => {
    try {
      const instructorId = instructorObjectId(req);
      if (!instructorId) {
        return Response.errorResponse(res, 401, { message: "Invalid instructor token" });
      }

      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOne({ _id: id, ...ownershipFilter(instructorId) })
        .populate("fieldId", "name icon")
        .populate("instructor.instructorId", "name email photo");

      if (!course) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      return Response.successResponse(res, 200, course);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getOverview: async (req, res) => {
    try {
      const instructorId = instructorObjectId(req);
      if (!instructorId) {
        return Response.errorResponse(res, 401, { message: "Invalid instructor token" });
      }

      const profile = await loadInstructorProfile(instructorId);
      const filter = ownershipFilter(instructorId);
      const courses = await Course.find(filter).select("title rating reviewCount isPublished");
      const courseIds = courses.map((course) => course._id);

      const purchases = courseIds.length
        ? await Purchase.find({ courseId: { $in: courseIds }, del_status: "Live" })
        : [];

      const enrollmentsByCourse = {};
      const uniqueStudents = new Set();
      purchases.forEach((purchase) => {
        uniqueStudents.add(String(purchase.studentID));
        const key = String(purchase.courseId);
        enrollmentsByCourse[key] = (enrollmentsByCourse[key] || 0) + 1;
      });

      const publishedCourses = courses.filter((course) => course.isPublished !== false).length;

      let ratingWeightedSum = 0;
      let ratingWeightedCount = 0;
      courses.forEach((course) => {
        const count = Number(course.reviewCount) || 0;
        const rating = Number(course.rating) || 0;
        if (count > 0 && rating > 0) {
          ratingWeightedSum += rating * count;
          ratingWeightedCount += count;
        }
      });
      const avgRating = ratingWeightedCount
        ? Math.round((ratingWeightedSum / ratingWeightedCount) * 10) / 10
        : 0;

      const topCourses = courses
        .map((course) => ({
          id: course.id || String(course._id),
          title: course.title?.trim() || "Untitled course",
          students: enrollmentsByCourse[String(course._id)] || 0,
          rating: Number(course.rating) || 0,
        }))
        .sort((a, b) => b.students - a.students)
        .slice(0, 5);

      return Response.successResponse(res, 200, {
        instructorName: profile?.name?.trim() || "Instructor",
        totalStudents: uniqueStudents.size,
        publishedCourses,
        avgRating,
        reviewCount: ratingWeightedCount,
        topCourses,
      });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getStudents: async (req, res) => {
    try {
      const instructorId = instructorObjectId(req);
      if (!instructorId) {
        return Response.errorResponse(res, 401, { message: "Invalid instructor token" });
      }

      const filter = ownershipFilter(instructorId);
      const courses = await Course.find(filter).select("title");
      const courseIds = courses.map((course) => course._id);

      if (!courseIds.length) {
        return Response.successResponse(res, 200, { students: [] });
      }

      const purchases = await Purchase.find({
        courseId: { $in: courseIds },
        del_status: "Live",
      })
        .populate("studentID", "profile.full_name profile.avatar_url email")
        .populate("courseId", "title")
        .sort({ created_at: -1 });

      const students = purchases.map((purchase) => {
        const student = purchase.studentID;
        const course = purchase.courseId;
        const name = student?.profile?.full_name?.trim() || student?.email || "Student";
        return {
          id: String(purchase._id),
          name,
          course: course?.title?.trim() || "Course",
          joined: purchase.created_at,
          avatar: student?.profile?.avatar_url?.trim() || "",
        };
      });

      return Response.successResponse(res, 200, { students });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getReviews: async (req, res) => {
    try {
      const instructorId = instructorObjectId(req);
      if (!instructorId) {
        return Response.errorResponse(res, 401, { message: "Invalid instructor token" });
      }

      const filter = ownershipFilter(instructorId);
      const courses = await Course.find(filter).select("title rating reviewCount");
      const courseIds = courses.map((course) => course._id);
      const courseTitleById = new Map(
        courses.map((course) => [String(course._id), course.title?.trim() || "Course"])
      );

      if (!courseIds.length) {
        return Response.successResponse(res, 200, {
          avgRating: 0,
          reviewCount: 0,
          reviews: [],
        });
      }

      const ratings = await CourseRating.find({ courseId: { $in: courseIds }, del_status: "Live" })
        .populate("studentID", "profile.full_name profile.avatar_url")
        .sort({ created_at: -1 });

      let ratingWeightedSum = 0;
      let ratingWeightedCount = 0;
      courses.forEach((course) => {
        const count = Number(course.reviewCount) || 0;
        const rating = Number(course.rating) || 0;
        if (count > 0 && rating > 0) {
          ratingWeightedSum += rating * count;
          ratingWeightedCount += count;
        }
      });

      const reviews = ratings.map((row) => ({
        id: row.id,
        name: row.studentID?.profile?.full_name?.trim() || "Student",
        avatar: row.studentID?.profile?.avatar_url?.trim() || "",
        course: courseTitleById.get(String(row.courseId)) || "Course",
        rating: row.rating,
        text: row.text || "",
        created_at: row.created_at,
      }));

      return Response.successResponse(res, 200, {
        avgRating: ratingWeightedCount
          ? Math.round((ratingWeightedSum / ratingWeightedCount) * 10) / 10
          : 0,
        reviewCount: ratingWeightedCount,
        reviews,
      });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
