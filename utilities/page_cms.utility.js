const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Response = require("./reponse.utility.js");
const ResponseMessage = require("./message.utility.js");

function buildPageCmsController(Model) {
  return {
    create: async (req, res) => {
      try {
        const doc = new Model(req.body);
        const saved = await doc.save();
        return Response.successResponse(res, 201, saved);
      } catch (err) {
        if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
        return Response.errorResponse(res, 500, err.message || err);
      }
    },

    getAll: async (_req, res) => {
      try {
        const docs = await Model.find({ del_status: "Live" }).sort({ created_at: -1 });
        if (!docs.length) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
        return Response.successResponse(res, 200, docs);
      } catch (err) {
        return Response.errorResponse(res, 500, err.message || err);
      }
    },

    update: async (req, res) => {
      try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });

        const doc = await Model.findOne({ _id: id, del_status: "Live" });
        if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

        Object.assign(doc, req.body);
        const updated = await doc.save();
        return Response.successResponse(res, 200, updated);
      } catch (err) {
        return Response.errorResponse(res, 500, err.message || err);
      }
    },
  };
}

module.exports = { buildPageCmsController };
