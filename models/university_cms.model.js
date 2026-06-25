const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const universityCmsSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Universities" },
    subtitle: {
      type: String,
      default:
        "Find universities and the courses they offer — Bachelor, Master, PhD, research and internships — with the scholarships that fund them.",
    },
    emptyStateText: { type: String, default: "No universities found." },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

universityCmsSchema.plugin(toJSON);
module.exports = mongoose.model("UniversityCms", universityCmsSchema, "university_cms");
