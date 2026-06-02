const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const contactSchema = new mongoose.Schema(
  {
    headerText: { type: String, default: "Contact" },
    title: { type: String, default: "Get in touch" },
    subtitle: { type: String, default: "We'd love to hear from you." },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

contactSchema.plugin(toJSON);
module.exports = mongoose.model("Contact", contactSchema);
