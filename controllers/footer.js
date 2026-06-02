const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Footer = require("../models/footer.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");

module.exports = {
  create: async (req, res) => {
    try {
      let doc = await Footer.findOne({ del_status: "Live" });

      if (doc) {
        Object.assign(doc, req.body);
        const updated = await doc.save();
        return Response.successResponse(res, 200, updated);
      }

      doc = new Footer(req.body);
      const saved = await doc.save();
      return Response.successResponse(res, 201, saved);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (_req, res) => {
    try {
      const docs = await Footer.find({ del_status: "Live" }).sort({ created_at: -1 });
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

      const doc = await Footer.findOne({ _id: id, del_status: "Live" });
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

      const doc = await Footer.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      Object.assign(doc, req.body);
      const updated = await doc.save();
      return Response.successResponse(res, 200, updated);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
