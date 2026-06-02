// controllers/home.js
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Home = require("../models/home.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

const OMIT_ON_WRITE_KEYS = [
  "myLearningTitle",
  "myLearningBadgeText",
  "myLearningViewAllButton",
  "myLearningEmptyTitle",
  "myLearningEmptyButton",
  "myLearningIsVisible",
  "featuredViewAllButton",
  "freeViewAllButton",
  "featuredCoursesBadgeText",
  "featuredCoursesTitle",
  "featuredCoursesSubtitle",
  "featuredCoursesLimit",
  "featuredCoursesIsVisible",
  "freeCoursesTitle",
  "freeCoursesSubtitle",
  "freeCoursesLimit",
  "freeCoursesIsVisible",
  "newsletterTitle",
  "newsletterSubtitle",
  "newsletterEmailPlaceholder",
  "newsletterSubmitButton",
  "newsletterIsVisible",
];

function omitOnWrite(input) {
  const data = input?.toObject ? input.toObject() : { ...(input || {}) };
  OMIT_ON_WRITE_KEYS.forEach((key) => delete data[key]);
  return data;
}

module.exports = {
  create: async (req, res) => {
    try {
      // Use native insert to avoid auto-applying schema defaults on create.
      const payload = omitOnWrite(req.body);
      const insertResult = await Home.collection.insertOne(payload);
      const created = await Home.findById(insertResult.insertedId);
      return Response.successResponse(res, 201, omitOnWrite(created));
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = { del_status: "Live" };
      const total = await Home.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      const rows = await Home.find(filter).sort({ created_at: -1 }).skip(skip).limit(pagination.pageSize);
      if (!rows.length) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);

      pagination.data = rows;
      return Response.paginationResponse(res, 200, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });

      const doc = await Home.findOne({ _id: id, del_status: "Live" });
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

      const doc = await Home.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      Object.assign(doc, omitOnWrite(req.body));
      const updated = await doc.save();
      return Response.successResponse(res, 200, omitOnWrite(updated));
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });

      const doc = await Home.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      doc.del_status = "Deleted";
      await doc.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
