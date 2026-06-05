const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const contactCmsSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Get in touch" },
    subtitle: { type: String, default: "We'd love to hear from you." },
    emptyStateText: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

contactCmsSchema.plugin(toJSON);
module.exports = mongoose.model("ContactCms", contactCmsSchema, "contact_cms");
