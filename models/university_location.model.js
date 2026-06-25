const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const universityLocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

universityLocationSchema.index(
  { name: 1, countryId: 1 },
  { unique: true, partialFilterExpression: { del_status: "Live" } }
);

universityLocationSchema.plugin(toJSON);
module.exports = mongoose.model(
  "UniversityLocation",
  universityLocationSchema,
  "university_locations"
);
