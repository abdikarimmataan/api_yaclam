const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const UniversityProgram = require("../models/university_program.model");
const { getAuthUserId } = require("../utilities/auth_user.utility");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function disciplineFilter(disciplineId) {
  if (disciplineId && isValidObjectId(String(disciplineId))) {
    return { disciplineId };
  }
  return { $or: [{ disciplineId: null }, { disciplineId: { $exists: false } }] };
}

async function findStudyAreaConflict(name, disciplineId, excludeId = null, delStatus = "Live") {
  const trimmed = String(name || "").trim();
  if (!trimmed) return null;

  const filter = {
    del_status: delStatus,
    name: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, "i") },
    ...disciplineFilter(disciplineId),
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return UniversityProgram.findOne(filter);
}

function studyAreaExistsMessage(name) {
  return `Study area "${String(name).trim()}" already exists`;
}

function buildFilter(req) {
  const filter = { del_status: "Live" };
  if (req.query.includeHidden !== "true") filter.isVisible = true;
  return filter;
}

function buildPayload(body = {}) {
  const payload = {};
  if (body.name != null) payload.name = String(body.name).trim();
  if (body.disciplineId !== undefined) {
    const id = String(body.disciplineId ?? "").trim();
    payload.disciplineId = id && isValidObjectId(id) ? id : null;
  }
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
      const payload = buildPayload(req.body);
      if (!payload.name) {
        return Response.errorResponse(res, 400, { message: "Name is required" });
      }

      const liveConflict = await findStudyAreaConflict(payload.name, payload.disciplineId);
      if (liveConflict) {
        return Response.customResponse(res, 409, studyAreaExistsMessage(payload.name));
      }

      const deletedRow = await findStudyAreaConflict(payload.name, payload.disciplineId, null, "Deleted");
      if (deletedRow) {
        Object.assign(deletedRow, payload, {
          del_status: "Live",
          isVisible: payload.isVisible !== false,
          ...(createdBy ? { created_by: String(createdBy) } : {}),
        });
        const restored = await deletedRow.save();
        return Response.successResponse(res, 201, restored);
      }

      const doc = new UniversityProgram({
        ...payload,
        ...(createdBy ? { created_by: String(createdBy) } : {}),
      });
      const saved = await doc.save();
      return Response.successResponse(res, 201, saved);
    } catch (err) {
      if (err?.code === 11000) {
        const name = String(req.body?.name ?? "").trim();
        return Response.customResponse(
          res,
          409,
          name ? studyAreaExistsMessage(name) : ResponseMessage.DATA_EXISTS
        );
      }
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = buildFilter(req);
      const total = await UniversityProgram.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      if (pagination.page > pagination.pages) return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);

      pagination.data = await UniversityProgram.find(filter)
        .populate("disciplineId", "name")
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
      const doc = await UniversityProgram.findOne({ _id: id, del_status: "Live" }).populate(
        "disciplineId",
        "name"
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
      const doc = await UniversityProgram.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      const payload = buildPayload(req.body);
      if (payload.name) {
        const duplicate = await findStudyAreaConflict(
          payload.name,
          payload.disciplineId !== undefined ? payload.disciplineId : doc.disciplineId,
          id
        );
        if (duplicate) {
          return Response.customResponse(res, 409, studyAreaExistsMessage(payload.name));
        }
      }

      Object.assign(doc, payload);
      const updated = await doc.save();
      return Response.successResponse(res, 200, updated);
    } catch (err) {
      if (err?.code === 11000) {
        const name = String(req.body?.name ?? "").trim();
        return Response.customResponse(
          res,
          409,
          name ? studyAreaExistsMessage(name) : ResponseMessage.DATA_EXISTS
        );
      }
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isVisible } = req.body;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });

      const doc = await UniversityProgram.findOneAndUpdate(
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
      const doc = await UniversityProgram.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      doc.del_status = "Deleted";
      await doc.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
