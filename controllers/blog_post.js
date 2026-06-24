const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const BlogPost = require("../models/blog_post.model");
const BlogCategory = require("../models/blog_category.model");
const User = require("../models/user.model");
const upload = require("../middlewares/upload.middleware");
const {
  buildPublicFilter,
  buildBlogPostPayload,
} = require("../utilities/blog_post.utility");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");

async function loadCategory(categoryId) {
  if (!isValidObjectId(categoryId)) return { error: "categoryId is required and must be a valid id" };
  const category = await BlogCategory.findOne({ _id: categoryId, del_status: "Live" });
  if (!category) return { error: "Blog category not found" };
  return { category };
}

async function loadAuthor(userId) {
  if (!isValidObjectId(userId)) return {};
  const user = await User.findOne({ _id: userId, del_status: "Live" }).select("profile.full_name");
  if (!user) return {};
  return { authorName: user.profile?.full_name || "" };
}

function formatPost(doc) {
  if (!doc) return doc;
  const json = doc.toJSON ? doc.toJSON() : doc;
  return {
    ...json,
    author: json.authorName || json.author,
    date: json.publishedDate || json.date,
  };
}

module.exports = {
  create: async (req, res) => {
    try {
      const categoryCheck = await loadCategory(req.body.categoryId);
      if (categoryCheck.error) {
        return Response.errorResponse(res, 400, { message: categoryCheck.error });
      }

      const author = await loadAuthor(req.user?.userId);
      const payload = buildBlogPostPayload(req.body, {
        userId: req.user?.userId,
        category: categoryCheck.category,
      });

      const blogPost = new BlogPost({
        ...payload,
        authorName: author.authorName || payload.authorName || "",
      });
      const saved = await blogPost.save();
      return Response.successResponse(res, 201, formatPost(saved));
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = buildPublicFilter(req);
      const total = await BlogPost.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      if (pagination.page > pagination.pages) return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);

      pagination.data = await BlogPost.find(filter)
        .populate("categoryId", "name description color")
        .sort({ publishedAt: -1, created_at: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      if (!pagination.data.length) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);

      pagination.data = pagination.data.map(formatPost);
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

      const filter = { _id: id, del_status: "Live" };
      if (!req.query.includeHidden && !req.query.includeDrafts) {
        filter.status = "published";
        filter.isVisible = { $ne: false };
      }

      const blogPost = await BlogPost.findOne(filter).populate("categoryId", "name description color");
      if (!blogPost) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, formatPost(blogPost));
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

      let category = null;
      if (req.body.categoryId) {
        const categoryCheck = await loadCategory(req.body.categoryId);
        if (categoryCheck.error) {
          return Response.errorResponse(res, 400, { message: categoryCheck.error });
        }
        category = categoryCheck.category;
      }

      const payload = buildBlogPostPayload(req.body, {
        category,
      });

      Object.assign(blogPost, payload);
      const updated = await blogPost.save();
      return Response.successResponse(res, 200, formatPost(updated));
    } catch (err) {
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

      const blogPost = await BlogPost.findOneAndUpdate({ _id: id, del_status: "Live" }, update, { new: true });
      if (!blogPost) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, formatPost(blogPost));
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

  uploadCoverImage: async (req, res) => {
    try {
      if (!req.file?.filename) {
        return Response.errorResponse(res, 400, { message: "coverImage file is required" });
      }
      const coverImage = upload.toPublicPath(req.file.filename, "blog");
      return Response.successResponse(res, 200, { coverImage });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
