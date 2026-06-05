const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const blogCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    color: { type: String, default: "#1F3A93" },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

blogCategorySchema.plugin(toJSON);
module.exports = mongoose.model("BlogCategory", blogCategorySchema, "blog_categories");
