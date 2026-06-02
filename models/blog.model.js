const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const blogSchema = new mongoose.Schema(
  {
    headerText: { type: String, default: "Blog" },
    title: { type: String, default: "Insights & Stories" },
    subtitle: { type: String, default: "Tips, success stories, and learning guides." },
    emptyStateText: { type: String, default: "No posts found." },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

blogSchema.plugin(toJSON);
module.exports = mongoose.model("Blog", blogSchema, "blog_page");
