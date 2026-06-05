const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const courseCmsSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Explore Courses" },
    subtitle: {
      type: String,
      default: "Practical, job-ready skills taught in Somali. Filter by topic, price and level to find your next course.",
    },
    emptyStateText: { type: String, default: "No courses found." },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

courseCmsSchema.plugin(toJSON);
module.exports = mongoose.model("CourseCms", courseCmsSchema, "course_cms");
