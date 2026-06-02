const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    category: { type: String, default: "" },
    readTime: { type: Number, default: 0 },
    publishedDate: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    authorName: { type: String, default: "" },
    tags: [{ type: String }],
    ctaButton: {
      label: { type: String, default: "Read more" },
      url: { type: String, default: "" },
      isVisible: { type: Boolean, default: true },
    },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

blogPostSchema.plugin(toJSON);
module.exports = mongoose.model("BlogPost", blogPostSchema, "blog_posts");
