const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const scholarshipsSchema = new mongoose.Schema(
  {
    headerText: { type: String, default: "Scholarships" },
    title: { type: String, default: "Find Scholarships" },
    subtitle: { type: String, default: "Global opportunities for Somali learners." },
    emptyStateText: { type: String, default: "No scholarships found." },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

scholarshipsSchema.plugin(toJSON);
module.exports = mongoose.model("Scholarships", scholarshipsSchema, "scholarships_page");
