const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Settings = require("../models/settings.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const upload = require("../middlewares/upload.middleware");

function toPublicSettings(doc) {
  const s = doc.toObject ? doc.toObject() : doc;
  return {
    id: s.id,
    siteName: s.siteName,
    siteNameArabic: s.siteNameArabic,
    siteTagline: s.siteTagline,
    logo: s.logo,
    favicon: s.favicon,
    contact: s.contact,
    socials: s.socials,
    seo: s.seo,
  };
}

module.exports = {
  create: async (req, res) => {
    try {
      let doc = await Settings.findOne({ del_status: "Live" });

      if (doc) {
        Object.assign(doc, req.body);
        const updated = await doc.save();
        return Response.successResponse(res, 200, toPublicSettings(updated));
      }

      doc = new Settings(req.body);
      const saved = await doc.save();
      return Response.successResponse(res, 201, toPublicSettings(saved));
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  get: async (_req, res) => {
    try {
      const doc = await Settings.findOne({ del_status: "Live", isVisible: { $ne: false } });
      if (!doc) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      return Response.successResponse(res, 200, toPublicSettings(doc));
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

      const doc = await Settings.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      Object.assign(doc, req.body);
      const updated = await doc.save();
      return Response.successResponse(res, 200, toPublicSettings(updated));
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  uploadLogo: async (req, res) => {
    try {
      if (!req.file?.filename) {
        return Response.errorResponse(res, 400, { message: "logo file is required" });
      }
      const logo = upload.toPublicPath(req.file.filename, "logo");
      return Response.successResponse(res, 200, { logo });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  uploadFavicon: async (req, res) => {
    try {
      if (!req.file?.filename) {
        return Response.errorResponse(res, 400, { message: "favicon file is required" });
      }
      const favicon = upload.toPublicPath(req.file.filename, "favicon");
      return Response.successResponse(res, 200, { favicon });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
