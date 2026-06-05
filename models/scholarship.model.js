const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const scholarshipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    title: { type: String, trim: true },
    provider: { type: String, default: "" },
    country: { type: String, default: "" },
    level: { type: String, default: "" },
    funding: {
      type: String,
      enum: ["Full", "Partial", ""],
      default: "Full",
    },
    flag: { type: String, default: "" },
    deadline: { type: String, default: "" },
    amount: { type: String, default: "" },
    website: { type: String, default: "" },
    overview: { type: String, default: "" },
    description: { type: String, default: "" },
    benefits: { type: [String], default: [] },
    eligibility: { type: [String], default: [] },
    documents: { type: [String], default: [] },
    applicationUrl: { type: String, default: "" },
    ctaButton: {
      label: { type: String, default: "Official Website" },
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

scholarshipSchema.pre("save", function syncScholarshipFields(next) {
  if (this.name && !this.title) this.title = this.name;
  if (!this.name && this.title) this.name = this.title;
  if (this.overview && !this.description) this.description = this.overview;
  if (!this.overview && this.description) this.overview = this.description;
  if (this.website && !this.applicationUrl) this.applicationUrl = this.website;
  if (!this.website && this.applicationUrl) this.website = this.applicationUrl;
  if (this.ctaButton && this.website && !this.ctaButton.url) {
    this.ctaButton.url = this.website;
  }
  next();
});

scholarshipSchema.plugin(toJSON);
module.exports = mongoose.model("Scholarship", scholarshipSchema, "scholarships");
