const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");
const { formatTimeToJobReadyDisplay } = require("../utilities/roadmap.utility");

const learningPathStepSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    detail: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    skills: { type: [String], default: [] },
    demand: {
      type: String,
      enum: ["Very High", "High", "Medium", ""],
      default: "High",
    },
    salary: { type: String, default: "" },
    months: { type: Number, default: 0 },
    timeToJobReady: { type: String, default: "" },
    skillsRequired: { type: Number, default: 0 },
    steps: { type: [learningPathStepSchema], default: [] },
    ctaButton: {
      label: { type: String, default: "Start this path" },
      url: { type: String, default: "/courses" },
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

roadmapSchema.pre("save", function syncSkillsRequired(next) {
  if (Array.isArray(this.skills) && (!this.skillsRequired || this.isModified("skills"))) {
    this.skillsRequired = this.skills.length;
  }
  if (this.timeToJobReady) {
    this.months = undefined;
  }
  next();
});

roadmapSchema.virtual("timeToJobReadyDisplay").get(function () {
  return formatTimeToJobReadyDisplay(this.timeToJobReady);
});

roadmapSchema.plugin(toJSON);
module.exports = mongoose.model("Roadmap", roadmapSchema, "roadmaps");
