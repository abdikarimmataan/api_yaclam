const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const BlogPost = require("../models/blog_post.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

module.exports = {
  create: async (req, res) => {
    try {
      const blogPost = new BlogPost(req.body);
      const saved = await blogPost.save();
      return Response.successResponse(res, 201, saved);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = { del_status: "Live", status: "published", isVisible: { $ne: false } };
      if (req.query.tag) filter.tags = req.query.tag;

      const total = await BlogPost.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await BlogPost.find(filter)
        .sort({ publishedAt: -1, created_at: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      if (!pagination.data || pagination.data.length === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

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

      const blogPost = await BlogPost.findOne({ _id: id, del_status: "Live" });
      if (!blogPost) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      return Response.successResponse(res, 200, blogPost);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getBySlug: async (req, res) => {
    try {
      const blogPost = await BlogPost.findOne({
        slug: req.params.slug.toLowerCase(),
        del_status: "Live",
        status: "published",
        isVisible: { $ne: false },
      });
      if (!blogPost) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, blogPost);
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

      const blogPost = await BlogPost.findOne({ _id: id, del_status: "Live" });
      if (!blogPost) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      Object.assign(blogPost, req.body);
      const updated = await blogPost.save();
      return Response.successResponse(res, 200, updated);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const update = { status };
      if (status === "published") update.publishedAt = new Date();

      const blogPost = await BlogPost.findOneAndUpdate(
        { _id: id, del_status: "Live" },
        update,
        { new: true }
      );
      if (!blogPost) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, blogPost);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const blogPost = await BlogPost.findOne({ _id: id, del_status: "Live" });
      if (!blogPost) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      blogPost.del_status = "Deleted";
      await blogPost.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
