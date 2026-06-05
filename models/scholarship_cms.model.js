const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const scholarshipCmsSchema = new mongoose.Schema(
  {
    headerText: { type: String, default: "Scholarship Portal" },
    title: { type: String, default: "Scholarship Portal" },
    subtitle: {
      type: String,
      default:
        "Funded study opportunities worldwide — eligibility, benefits and deadlines, explained for Somali applicants.",
    },
    emptyStateText: { type: String, default: "No scholarships found." },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

scholarshipCmsSchema.plugin(toJSON);
module.exports = mongoose.model("ScholarshipCms", scholarshipCmsSchema, "scholarship_cms");
