const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const whyYaclamSchema = new mongoose.Schema(
  {
    icon: { type: String, default: "Globe" },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

whyYaclamSchema.plugin(toJSON);
module.exports = mongoose.model("WhyYaclam", whyYaclamSchema, "why_yaclam");
