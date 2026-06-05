const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const pageSchema = new mongoose.Schema(
  {
    pageKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    path: { type: String, required: true, trim: true },
    title: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    sections: { type: [mongoose.Schema.Types.Mixed], default: [] },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

pageSchema.plugin(toJSON);
module.exports = mongoose.model("Page", pageSchema, "pages");
