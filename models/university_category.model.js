const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const universityCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    created_by: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

universityCategorySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { del_status: "Live" } }
);

universityCategorySchema.plugin(toJSON);
module.exports = mongoose.model(
  "UniversityCategory",
  universityCategorySchema,
  "university_categories"
);
