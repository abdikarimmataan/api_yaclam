const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");
const { deriveInitials } = require("../utilities/practitioner.utility");

const testimonialSchema = new mongoose.Schema(
  {
    text: { type: String, default: "" },
    description: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    initials: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "" },
    location: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

testimonialSchema.pre("save", function syncTestimonialFields(next) {
  if (this.text && !this.description) this.description = this.text;
  if (!this.text && this.description) this.text = this.description;
  if (!this.initials && this.name) {
    this.initials = deriveInitials(this.name);
  }
  next();
});

testimonialSchema.pre("validate", function requireQuote(next) {
  if (!this.text && !this.description) {
    this.invalidate("text", "Quote text is required");
  }
  next();
});

testimonialSchema.plugin(toJSON);
module.exports = mongoose.model("Testimonial", testimonialSchema, "testimonials");
