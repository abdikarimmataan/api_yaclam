const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const coursesSchema = new mongoose.Schema(
  {
    headerText: { type: String, default: "Explore Courses" },
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

coursesSchema.plugin(toJSON);
module.exports = mongoose.model("Courses", coursesSchema, "courses_page");
