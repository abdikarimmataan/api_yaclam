const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const universityLanguageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      default: null,
    },
    created_by: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

universityLanguageSchema.index(
  { name: 1, countryId: 1 },
  { unique: true, partialFilterExpression: { del_status: "Live" } }
);

universityLanguageSchema.plugin(toJSON);
module.exports = mongoose.model(
  "UniversityLanguage",
  universityLanguageSchema,
  "university_languages"
);
