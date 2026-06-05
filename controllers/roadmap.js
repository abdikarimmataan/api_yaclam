const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Roadmap = require("../models/roadmap.model");
const { buildRoadmapPayload } = require("../utilities/roadmap.utility");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

module.exports = {
  create: async (req, res) => {
    try {
      const roadmap = new Roadmap(buildRoadmapPayload(req.body));
      const saved = await roadmap.save();
      return Response.successResponse(res, 201, saved);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = { del_status: "Live" };
      if (req.query.isPublished === "true") filter.isPublished = true;

      const total = await Roadmap.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await Roadmap.find(filter)
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

      const roadmap = await Roadmap.findOne({ _id: id, del_status: "Live" });
      if (!roadmap) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      return Response.successResponse(res, 200, roadmap);
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

      const roadmap = await Roadmap.findOne({ _id: id, del_status: "Live" });
      if (!roadmap) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      Object.assign(roadmap, buildRoadmapPayload(req.body));
      const updated = await roadmap.save();
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

      const roadmap = await Roadmap.findOneAndUpdate(
        { _id: id, del_status: "Live" },
        { status },
        { new: true }
      );
      if (!roadmap) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, roadmap);
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

      const roadmap = await Roadmap.findOne({ _id: id, del_status: "Live" });
      if (!roadmap) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      roadmap.del_status = "Deleted";
      await roadmap.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
