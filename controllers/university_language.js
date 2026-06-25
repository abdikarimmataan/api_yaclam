const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const UniversityLanguage = require("../models/university_language.model");
const { getAuthUserId } = require("../utilities/auth_user.utility");
const { normalizeObjectId } = require("../utilities/university.utility");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

function buildFilter(req) {
  const filter = { del_status: "Live" };
  if (req.query.includeHidden !== "true") filter.isVisible = true;
  return filter;
}

function buildPayload(body = {}) {
  const payload = {};
  if (body.name != null) payload.name = String(body.name).trim();
  if (body.countryId !== undefined) payload.countryId = normalizeObjectId(body.countryId);
  if (body.isVisible !== undefined) {
    if (body.isVisible === "true" || body.isVisible === "1") payload.isVisible = true;
    else if (body.isVisible === "false" || body.isVisible === "0") payload.isVisible = false;
    else payload.isVisible = Boolean(body.isVisible);
  }
  return payload;
}

module.exports = {
  create: async (req, res) => {
    try {
      const createdBy = getAuthUserId(req);
      const doc = new UniversityLanguage({
        ...buildPayload(req.body),
        ...(createdBy ? { created_by: String(createdBy) } : {}),
      });
      const saved = await doc.save();
      const populated = await UniversityLanguage.findById(saved._id).populate("countryId", "name flag code");
      return Response.successResponse(res, 201, populated ?? saved);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = buildFilter(req);
      const total = await UniversityLanguage.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      if (pagination.page > pagination.pages) return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);

      pagination.data = await UniversityLanguage.find(filter)
        .populate("countryId", "name flag code")
        .sort({ name: 1 })
        .skip(skip)
        .limit(pagination.pageSize);
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
      const doc = await UniversityLanguage.findOne({ _id: id, del_status: "Live" }).populate(
        "countryId",
        "name flag code"
      );
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
      const doc = await UniversityLanguage.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      Object.assign(doc, buildPayload(req.body));
      const updated = await doc.save();
      const populated = await UniversityLanguage.findById(updated._id).populate("countryId", "name flag code");
      return Response.successResponse(res, 200, populated ?? updated);
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

      const doc = await UniversityLanguage.findOneAndUpdate(
        { _id: id, del_status: "Live" },
        { isVisible },
        { new: true }
      ).populate("countryId", "name flag code");
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
      const doc = await UniversityLanguage.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      doc.del_status = "Deleted";
      await doc.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
