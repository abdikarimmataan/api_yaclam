const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const stepSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    order: Number,
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    skills: [{ type: String }],
    steps: [stepSchema],
    ctaButton: {
      label: { type: String, default: "View roadmap" },
      url: { type: String, default: "" },
      isVisible: { type: Boolean, default: true },
    },
    isPublished: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

roadmapSchema.plugin(toJSON);
module.exports = mongoose.model("Roadmap", roadmapSchema, "roadmaps");
