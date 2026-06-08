const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Course = require("../models/course.model");
const Instructor = require("../models/instructor.model");
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
};
