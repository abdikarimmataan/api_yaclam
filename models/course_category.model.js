const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const courseCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

courseCategorySchema.plugin(toJSON);
module.exports = mongoose.model("CourseCategory", courseCategorySchema, "course_categories");
