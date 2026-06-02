const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const testimonialSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
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

testimonialSchema.plugin(toJSON);
module.exports = mongoose.model("Testimonial", testimonialSchema, "testimonials");
