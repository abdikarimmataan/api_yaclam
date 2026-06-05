const Country = require("../models/country.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");

module.exports = {
  getAll: async (_req, res) => {
    try {
      const docs = await Country.find({ del_status: "Live", isVisible: true }).sort({ name: 1 });
      if (!docs.length) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      return Response.successResponse(res, 200, docs);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
