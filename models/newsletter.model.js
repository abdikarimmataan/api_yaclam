const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const newsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "website" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "subscribed_at", updatedAt: "updated_at" } }
);

newsletterSchema.plugin(toJSON);
module.exports = mongoose.model("NewsletterSubscriber", newsletterSchema);
