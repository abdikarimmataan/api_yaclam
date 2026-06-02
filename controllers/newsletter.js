const NewsletterSubscriber = require("../models/newsletter.model");
const response = require("../utilities/reponse.utility");
const message = require("../utilities/message.utility");
const PaginationUtility = require("../utilities/pagination_utility");

module.exports = {
  subscribe: async (req, res) => {
    try {
      const { email, source } = req.body;
      const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
      if (existing) return response.customResponse(res, 409, "Email already subscribed");

      const sub = await NewsletterSubscriber.create({
        email: email.toLowerCase(),
        source: source || "website",
      });
      return response.successResponse(res, 201, sub);
    } catch (err) {
      return response.errorResponse(res, 500, err);
    }
  },

  getAll: async (req, res) => {
    try {
      const total = await NewsletterSubscriber.countDocuments({ isActive: true });
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);
      pagination.data = await NewsletterSubscriber.find({ isActive: true })
        .sort({ subscribed_at: -1 })
        .skip(skip)
        .limit(pagination.pageSize);
      return response.paginationResponse(res, 200, pagination);
    } catch (err) {
      return response.errorResponse(res, 500, err);
    }
  },
};
