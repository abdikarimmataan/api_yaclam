const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const buttonSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    url: { type: String, default: "" },
    style: { type: String, default: "primary" },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    category: { type: String, default: "" },
    fieldId: { type: mongoose.Schema.Types.ObjectId, ref: "Field", default: null },
    level: { type: String, default: "Beginner" },
    duration: { type: String, default: "" },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    instructorName: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    price: { type: Number, default: 0 },
    originalPrice: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    durationHours: { type: Number, default: 0 },
    lessonCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    studentCount: { type: Number, default: 0 },
    badges: {
      premium: { text: { type: String, default: "PREMIUM" }, isVisible: { type: Boolean, default: true } },
      free: { text: { type: String, default: "FREE" }, isVisible: { type: Boolean, default: true } },
    },
    ctaButton: {
      type: buttonSchema,
      default: () => ({ label: "Buy", isVisible: true }),
    },
    wishlistButton: { isVisible: { type: Boolean, default: true } },
    sortOrder: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

courseSchema.plugin(toJSON);
module.exports = mongoose.model("Course", courseSchema, "courses");
