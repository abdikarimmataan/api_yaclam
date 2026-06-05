const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, default: "", trim: true, uppercase: true },
    flag: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

countrySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { del_status: "Live" } }
);

countrySchema.plugin(toJSON);
module.exports = mongoose.model("Country", countrySchema, "countries");
