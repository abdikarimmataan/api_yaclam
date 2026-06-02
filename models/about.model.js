const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const aboutSchema = new mongoose.Schema(
  {
    headerText: { type: String, default: "About" },
    title: { type: String, default: "About Yaclam" },
    subtitle: { type: String, default: "Somalia's premier AI-powered e-learning platform." },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

aboutSchema.plugin(toJSON);
module.exports = mongoose.model("About", aboutSchema);
