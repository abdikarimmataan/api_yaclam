const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    permissions: [{ type: String }],
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

roleSchema.plugin(toJSON);
module.exports = mongoose.model("Role", roleSchema);
