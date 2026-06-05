const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    excerpt: { type: String, default: "" },
    body: { type: [String], default: [] },
    content: { type: String, default: "" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "BlogCategory", required: true },
    category: { type: String, default: "" },
    color: { type: String, default: "#1F3A93" },
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

blogPostSchema.pre("save", function syncBlogContent(next) {
  if (Array.isArray(this.body) && this.body.length && !this.content) {
    this.content = this.body.join("\n\n");
  }
  if (this.content && (!this.body || !this.body.length)) {
    this.body = this.content
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

blogPostSchema.plugin(toJSON);
module.exports = mongoose.model("BlogPost", blogPostSchema, "blog_posts");
