const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const roadmapCmsSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Your path to a career" },
    subtitle: { type: String, default: "Salary data, in-demand skills and a guided learning sequence for every role." },
    emptyStateText: { type: String, default: "No roadmaps found." },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

roadmapCmsSchema.plugin(toJSON);
module.exports = mongoose.model("RoadmapCms", roadmapCmsSchema, "roadmap_cms");
