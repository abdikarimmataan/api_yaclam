const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const aboutCmsSchema = new mongoose.Schema(
  {
    title: { type: String, default: "About Yaclam" },
    subtitle: { type: String, default: "Somalia's premier AI-powered e-learning platform." },
    emptyStateText: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

aboutCmsSchema.plugin(toJSON);
module.exports = mongoose.model("AboutCms", aboutCmsSchema, "about_cms");
