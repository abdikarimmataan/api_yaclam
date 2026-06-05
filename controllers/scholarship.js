const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Scholarship = require("../models/scholarship.model");
const { buildScholarshipPayload } = require("../utilities/scholarship.utility");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

async function getNextScholarshipSortOrder() {
  const last = await Scholarship.findOne({ del_status: "Live" })
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean();
  if (!last) return 1;
  return (last.sortOrder ?? 0) + 1;
}

async function findLiveScholarshipByExactName(name, excludeId = null) {
  const trimmedName = name.trim();
  const filter = { del_status: "Live", name: trimmedName };
  if (excludeId) filter._id = { $ne: excludeId };
  return Scholarship.findOne(filter);
}

module.exports = {
  create: async (req, res) => {
    try {
      const payload = buildScholarshipPayload(req.body);

      if (payload.name) {
        const existing = await findLiveScholarshipByExactName(payload.name);
        if (existing) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      }

      const sortOrder =
        req.body.sortOrder != null && Number.isFinite(Number(req.body.sortOrder))
          ? Math.max(0, Math.trunc(Number(req.body.sortOrder)))
          : await getNextScholarshipSortOrder();
      const scholarship = new Scholarship({ ...payload, sortOrder });
      const saved = await scholarship.save();
      return Response.successResponse(res, 201, saved);
    } catch (err) {
      if (err?.code === 11000 && err?.keyPattern?.name) {
        return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      }
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = { del_status: "Live" };
      if (req.query.isFeatured === "true") filter.isFeatured = true;
      if (req.query.isPublished === "true") filter.isPublished = true;

      const total = await Scholarship.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await Scholarship.find(filter)
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

      const scholarship = await Scholarship.findOne({ _id: id, del_status: "Live" });
      if (!scholarship) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      return Response.successResponse(res, 200, scholarship);
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

      const scholarship = await Scholarship.findOne({ _id: id, del_status: "Live" });
      if (!scholarship) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      const payload = buildScholarshipPayload(req.body);
      if (payload.name) {
        const duplicate = await findLiveScholarshipByExactName(payload.name, id);
        if (duplicate) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      }

      Object.assign(scholarship, payload);
      const updated = await scholarship.save();
      return Response.successResponse(res, 200, updated);
    } catch (err) {
      if (err?.code === 11000 && err?.keyPattern?.name) {
        return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      }
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

      const scholarship = await Scholarship.findOneAndUpdate(
        { _id: id, del_status: "Live" },
        { status },
        { new: true }
      );
      if (!scholarship) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, scholarship);
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

      const scholarship = await Scholarship.findOne({ _id: id, del_status: "Live" });
      if (!scholarship) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      scholarship.del_status = "Deleted";
      await scholarship.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
