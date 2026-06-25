const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const programSchema = new mongoose.Schema(
  {
    course: { type: String, default: "" },
    field: { type: String, default: "" },
    level: { type: String, default: "" },
    duration: { type: String, default: "" },
    language: { type: String, default: "" },
    tuition: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { _id: false }
);

const offeringSchema = new mongoose.Schema(
  {
    studyAreaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UniversityProgram",
      default: null,
    },
    disciplineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UniversityDiscipline",
      default: null,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UniversityCategory",
      default: null,
    },
    year: { type: String, default: "" },
    languageIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "UniversityLanguage" }],
      default: [],
    },
    feePerYear: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  { _id: true }
);

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, default: "", trim: true },
    country: { type: String, default: "" },
    region: { type: String, default: "" },
    city: { type: String, default: "" },
    flag: { type: String, default: "" },
    ranking: { type: String, default: "" },
    programs: { type: [programSchema], default: [] },
    offerings: { type: [offeringSchema], default: [] },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UniversityLocation",
      default: null,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UniversityCategory",
      default: null,
    },
    year: { type: String, default: "" },
    languageIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "UniversityLanguage" }],
      default: [],
    },
    feePerYear: { type: String, default: "" },
    website: { type: String, default: "" },
    isPublished: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

universitySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { del_status: "Live" } }
);

universitySchema.plugin(toJSON);
module.exports = mongoose.model("University", universitySchema, "universities");
