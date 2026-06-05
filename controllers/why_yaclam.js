const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const WhyYaclam = require("../models/why_yaclam.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

async function getNextWhyYaclamSortOrder() {
  const last = await WhyYaclam.findOne({ del_status: "Live" })
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean();
  if (!last) return 1;
  return (last.sortOrder ?? 0) + 1;
}

module.exports = {
  create: async (req, res) => {
    try {
      const sortOrder =
        req.body.sortOrder != null && Number.isFinite(Number(req.body.sortOrder))
          ? Math.max(0, Math.trunc(Number(req.body.sortOrder)))
          : await getNextWhyYaclamSortOrder();
      const doc = new WhyYaclam({ ...req.body, sortOrder });
      const saved = await doc.save();
      return Response.successResponse(res, 201, saved);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = { del_status: "Live" };
      const total = await WhyYaclam.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      if (pagination.page > pagination.pages) return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);

      pagination.data = await WhyYaclam.find(filter).sort({ sortOrder: 1, created_at: -1 }).skip(skip).limit(pagination.pageSize);
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
      const doc = await WhyYaclam.findOne({ _id: id, del_status: "Live" });
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
      const doc = await WhyYaclam.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      Object.assign(doc, req.body);
      const updated = await doc.save();
      return Response.successResponse(res, 200, updated);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      const doc = await WhyYaclam.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      doc.del_status = "Deleted";
      await doc.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
