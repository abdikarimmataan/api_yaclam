const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "" },
    body: { type: [String], default: [] },
    content: { type: String, default: "" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "BlogCategory", required: true },
    category: { type: String, default: "" },
    color: { type: String, default: "#1F3A93" },
    readTime: { type: Number, default: 0 },
    publishedDate: { type: Date, default: null },
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

function isHtmlContent(text) {
  return /<[a-z][\s\S]*>/i.test(String(text ?? "").trim());
}

blogPostSchema.pre("save", function syncBlogContent(next) {
  if (this.content && isHtmlContent(this.content)) {
    this.body = [this.content];
    return next();
  }
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

const BlogPost = mongoose.model("BlogPost", blogPostSchema, "blog_posts");

async function dropBlogTitleUniqueIndex() {
  if (mongoose.connection.readyState !== 1) return;

  try {
    const collection = mongoose.connection.collection("blog_posts");
    const indexes = await collection.indexes();
    for (const index of indexes) {
      if (index.key?.title === 1 && index.unique) {
        await collection.dropIndex(index.name);
      }
    }
  } catch (_) {
    // index may not exist yet
  }
}

if (mongoose.connection.readyState === 1) {
  dropBlogTitleUniqueIndex();
} else {
  mongoose.connection.once("connected", dropBlogTitleUniqueIndex);
}

module.exports = BlogPost;
