const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

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

const universityManageSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    offerings: { type: [offeringSchema], default: [] },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

universityManageSchema.index(
  { universityId: 1 },
  { unique: true, partialFilterExpression: { del_status: "Live" } }
);

universityManageSchema.plugin(toJSON);
module.exports = mongoose.model(
  "UniversityManage",
  universityManageSchema,
  "university_manages"
);
