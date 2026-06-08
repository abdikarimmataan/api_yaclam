const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const ContactCms = require("../models/contact_cms.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");

const SECTION_KEYS = ["pageSection", "emailSection", "phoneSection", "locationSection"];

function mergeSection(existing = {}, incoming = {}) {
  return { ...existing, ...incoming };
}

function normalizePayload(payload = {}) {
  const data = { ...payload };

  const hasLegacyHero =
    data.title !== undefined || data.subtitle !== undefined || data.emptyStateText !== undefined;

  if (hasLegacyHero) {
    data.pageSection = mergeSection(data.pageSection || {}, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.subtitle !== undefined ? { subtitle: data.subtitle } : {}),
    });
  }

  return data;
}

function applySectionVisibility(payload = {}) {
  const data = normalizePayload(payload);

  SECTION_KEYS.forEach((key) => {
    if (data[key] && typeof data[key] === "object" && data[key].isVisible === undefined) {
      data[key] = { ...data[key], isVisible: true };
    }
  });

  if (data.pageSection?.title) {
    data.title = data.pageSection.title;
  }
  if (data.pageSection?.subtitle) {
    data.subtitle = data.pageSection.subtitle;
  }

  return data;
}

function applyUpdate(doc, payload = {}) {
  const data = applySectionVisibility(payload);

  SECTION_KEYS.forEach((key) => {
    if (data[key] !== undefined) {
      doc[key] = mergeSection(doc[key]?.toObject?.() ?? doc[key] ?? {}, data[key]);
      delete data[key];
    }
  });

  Object.assign(doc, data);
}

module.exports = {
  create: async (req, res) => {
    try {
      const doc = new ContactCms(applySectionVisibility(req.body));
      const saved = await doc.save();
      return Response.successResponse(res, 201, saved);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (_req, res) => {
    try {
      const docs = await ContactCms.find({ del_status: "Live" }).sort({ created_at: -1 });
      if (!docs.length) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      return Response.successResponse(res, 200, docs);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });

      const doc = await ContactCms.findOne({ _id: id, del_status: "Live" });
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

      const doc = await ContactCms.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      applyUpdate(doc, req.body);
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

      const doc = await ContactCms.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      doc.del_status = "Deleted";
      await doc.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
