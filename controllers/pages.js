const Page = require("../models/page.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");

const ALLOWED_KEYS = ["home", "about", "contact"];

function toPublicPage(doc) {
  const p = doc.toObject ? doc.toObject() : doc;
  return {
    path: p.path,
    title: p.title,
    status: p.status,
    sections: p.sections || [],
  };
}

module.exports = {
  getByKey: async (req, res) => {
    try {
      const pageKey = req.params.pageKey?.toLowerCase();
      if (!ALLOWED_KEYS.includes(pageKey)) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      const doc = await Page.findOne({
        pageKey,
        del_status: "Live",
        status: "published",
        isVisible: { $ne: false },
      });

      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, toPublicPage(doc));
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  updateByKey: async (req, res) => {
    try {
      const pageKey = req.params.pageKey?.toLowerCase();
      if (!ALLOWED_KEYS.includes(pageKey)) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      const doc = await Page.findOne({ pageKey, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      const { path, title, status, sections } = req.body;
      if (path !== undefined) doc.path = path;
      if (title !== undefined) doc.title = title;
      if (status !== undefined) doc.status = status;
      if (sections !== undefined) doc.sections = sections;

      const updated = await doc.save();
      return Response.successResponse(res, 200, toPublicPage(updated));
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
