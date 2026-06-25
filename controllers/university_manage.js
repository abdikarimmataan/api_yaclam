const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const University = require("../models/university.model");
const UniversityManage = require("../models/university_manage.model");
const {
  buildManagePayload,
  syncManageOfferingsToUniversity,
  clearUniversityManageData,
  MANAGE_POPULATE,
} = require("../utilities/university_manage.utility");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

async function findLiveManageByUniversity(universityId, excludeId = null) {
  const filter = { del_status: "Live", universityId };
  if (excludeId) filter._id = { $ne: excludeId };
  return UniversityManage.findOne(filter);
}

module.exports = {
  create: async (req, res) => {
    try {
      const payload = buildManagePayload(req.body);
      if (!payload.universityId) {
        return Response.errorResponse(res, 400, { message: "University is required" });
      }

      const university = await University.findOne({
        _id: payload.universityId,
        del_status: "Live",
      });
      if (!university) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      const existing = await findLiveManageByUniversity(payload.universityId);
      if (existing) {
        return Response.customResponse(res, 409, "This university already has a manage record");
      }

      const doc = new UniversityManage(payload);
      const saved = await doc.save();
      await syncManageOfferingsToUniversity(saved.universityId, saved.offerings);

      const populated = await UniversityManage.findById(saved._id).populate(MANAGE_POPULATE);
      return Response.successResponse(res, 201, populated ?? saved);
    } catch (err) {
      if (err?.code === 11000) {
        return Response.customResponse(res, 409, "This university already has a manage record");
      }
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = { del_status: "Live" };
      const total = await UniversityManage.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await UniversityManage.find(filter)
        .populate(MANAGE_POPULATE)
        .sort({ updated_at: -1 })
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

      const doc = await UniversityManage.findOne({ _id: id, del_status: "Live" }).populate(
        MANAGE_POPULATE
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
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const doc = await UniversityManage.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      const payload = buildManagePayload(req.body);
      if (payload.universityId && String(payload.universityId) !== String(doc.universityId)) {
        const duplicate = await findLiveManageByUniversity(payload.universityId, id);
        if (duplicate) {
          return Response.customResponse(res, 409, "This university already has a manage record");
        }
        const university = await University.findOne({
          _id: payload.universityId,
          del_status: "Live",
        });
        if (!university) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      Object.assign(doc, payload);
      const updated = await doc.save();
      await syncManageOfferingsToUniversity(updated.universityId, updated.offerings);

      const populated = await UniversityManage.findById(updated._id).populate(MANAGE_POPULATE);
      return Response.successResponse(res, 200, populated ?? updated);
    } catch (err) {
      if (err?.code === 11000) {
        return Response.customResponse(res, 409, "This university already has a manage record");
      }
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const doc = await UniversityManage.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      const universityId = doc.universityId;
      doc.del_status = "Deleted";
      await doc.save();
      await clearUniversityManageData(universityId);

      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
