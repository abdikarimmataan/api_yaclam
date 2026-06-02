// controllers/course.js
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Course = require("../models/course.model");
const Field = require("../models/field.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

module.exports = {
  create: async (req, res) => {
    try {
      const { fieldId } = req.body;
      if (!isValidObjectId(fieldId)) {
        return Response.errorResponse(res, 400, { message: "fieldId is required and must be a valid id" });
      }

      const field = await Field.findOne({ _id: fieldId, del_status: "Live" });
      if (!field) {
        return Response.customResponse(res, 404, "Field not found");
      }

      const course = new Course(req.body);
      const saved = await course.save();
      return Response.successResponse(res, 201, saved);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = { del_status: "Live" };
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
        .populate("fieldId", "name slug icon")
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
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOne({ _id: id, del_status: "Live" }).populate("fieldId", "name slug icon");
      if (!course) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      return Response.successResponse(res, 200, course);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getBySlug: async (req, res) => {
    try {
      const course = await Course.findOne({
        slug: req.params.slug.toLowerCase(),
        del_status: "Live",
      }).populate("fieldId", "name slug icon");
      if (!course) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, course);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOne({ _id: id, del_status: "Live" });
      if (!course) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      if (req.body.fieldId !== undefined) {
        if (!isValidObjectId(req.body.fieldId)) {
          return Response.errorResponse(res, 400, { message: "fieldId must be a valid id" });
        }
        const field = await Field.findOne({ _id: req.body.fieldId, del_status: "Live" });
        if (!field) {
          return Response.customResponse(res, 404, "Field not found");
        }
      }

      Object.assign(course, req.body);
      const updated = await course.save();
      return Response.successResponse(res, 200, updated);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOneAndUpdate(
        { _id: id, del_status: "Live" },
        { status },
        { new: true }
      );
      if (!course) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, course);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOne({ _id: id, del_status: "Live" });
      if (!course) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      course.del_status = "Deleted";
      await course.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
