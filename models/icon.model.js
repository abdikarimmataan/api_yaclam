const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const iconSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    label: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

iconSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { del_status: "Live" } }
);

iconSchema.plugin(toJSON);
module.exports = mongoose.model("Icon", iconSchema, "icons");
