const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Field = require("../models/field.model");
const Course = require("../models/course.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

module.exports = {
  create: async (req, res) => {
    try {
      const doc = new Field(req.body);
      const saved = await doc.save();
      return Response.successResponse(res, 201, saved);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAllFieldByCourse: async (req, res) => {
    try {
      const data = await Field.aggregate([
        { $match: { del_status: "Live" } },
        {
          $lookup: {
            from: Course.collection.name,
            let: { fieldId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$fieldId", "$$fieldId"] },
                  del_status: "Live",
                },
              },
            ],
            as: "courses",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            icon: 1,
            sortOrder: 1,
            isVisible: 1,
            courseCount: { $size: "$courses" },
          },
        },
        {
          $addFields: {
            label: {
              $concat: [
                { $ifNull: ["$name", ""] },
                " - ",
                { $toString: "$courseCount" },
              ],
            },
          },
        },
        { $sort: { sortOrder: 1, name: 1 } },
      ]);

      if (!data.length) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      return Response.successResponse(res, 200, data);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = { del_status: "Live" };
      const total = await Field.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await Field.find(filter).sort({ sortOrder: 1, created_at: -1 }).skip(skip).limit(pagination.pageSize);
      if (!pagination.data.length) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);

      return Response.paginationResponse(res, 200, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });

      const doc = await Field.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, doc);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });

      const doc = await Field.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      Object.assign(doc, req.body);
      const updated = await doc.save();
      return Response.successResponse(res, 200, updated);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isVisible } = req.body;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });

      const doc = await Field.findOneAndUpdate(
        { _id: id, del_status: "Live" },
        { isVisible },
        { new: true }
      );
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, doc);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });

      const doc = await Field.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      doc.del_status = "Deleted";
      await doc.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
