const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const University = require("../models/university.model");
const {
  buildUniversityPayload,
  applyUniversityAdminSync,
  UNIVERSITY_POPULATE,
} = require("../utilities/university.utility");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

async function getNextUniversitySortOrder() {
  const last = await University.findOne({ del_status: "Live" })
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean();
  if (!last) return 1;
  return (last.sortOrder ?? 0) + 1;
}

async function findLiveUniversityByExactName(name, excludeId = null) {
  const trimmedName = name.trim();
  const filter = { del_status: "Live", name: trimmedName };
  if (excludeId) filter._id = { $ne: excludeId };
  return University.findOne(filter);
}

module.exports = {
  create: async (req, res) => {
    try {
      const payload = buildUniversityPayload(req.body);

      if (payload.name) {
        const existing = await findLiveUniversityByExactName(payload.name);
        if (existing) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      }

      const sortOrder =
        req.body.sortOrder != null && Number.isFinite(Number(req.body.sortOrder))
          ? Math.max(0, Math.trunc(Number(req.body.sortOrder)))
          : await getNextUniversitySortOrder();

      const university = new University({ ...payload, sortOrder });
      await applyUniversityAdminSync(university);
      const saved = await university.save();
      const populated = await University.findById(saved._id).populate(UNIVERSITY_POPULATE);
      return Response.successResponse(res, 201, populated ?? saved);
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
      if (req.query.includeHidden !== "true") filter.isVisible = true;
      if (req.query.isPublished === "true") filter.isPublished = true;

      const total = await University.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      if (pagination.page > pagination.pages) return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);

      pagination.data = await University.find(filter)
        .populate(UNIVERSITY_POPULATE)
        .sort({ sortOrder: 1, created_at: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      if (!pagination.data?.length) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
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

      const university = await University.findOne({ _id: id, del_status: "Live" }).populate(
        UNIVERSITY_POPULATE
      );
      if (!university) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      return Response.successResponse(res, 200, university);
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

      const university = await University.findOne({ _id: id, del_status: "Live" });
      if (!university) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      const payload = buildUniversityPayload(req.body);
      if (payload.name) {
        const duplicate = await findLiveUniversityByExactName(payload.name, id);
        if (duplicate) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      }

      Object.assign(university, payload);
      if (req.body.programs === undefined) {
        await applyUniversityAdminSync(university);
      }
      const updated = await university.save();
      const populated = await University.findById(updated._id).populate(UNIVERSITY_POPULATE);
      return Response.successResponse(res, 200, populated ?? updated);
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
      const { isVisible } = req.body;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const university = await University.findOneAndUpdate(
        { _id: id, del_status: "Live" },
        { isVisible },
        { new: true }
      ).populate(UNIVERSITY_POPULATE);
      if (!university) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, university);
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

      const university = await University.findOne({ _id: id, del_status: "Live" });
      if (!university) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      university.del_status = "Deleted";
      await university.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
