const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const scholarshipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    provider: { type: String, default: "" },
    country: { type: String, default: "" },
    level: { type: String, default: "" },
    funding: { type: String, default: "" },
    flag: { type: String, default: "" },
    amount: { type: String, default: "" },
    deadline: { type: String, default: "" },
    eligibility: { type: String, default: "" },
    description: { type: String, default: "" },
    applicationUrl: { type: String, default: "" },
    ctaButton: {
      label: { type: String, default: "Apply" },
      url: { type: String, default: "" },
      isVisible: { type: Boolean, default: true },
    },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

scholarshipSchema.pre("save", function syncTitle(next) {
  if (this.name && !this.title) this.title = this.name;
  if (!this.name && this.title) this.name = this.title;
  next();
});

scholarshipSchema.plugin(toJSON);
module.exports = mongoose.model("Scholarship", scholarshipSchema, "scholarships");
