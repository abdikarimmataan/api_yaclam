const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Yaclam" },
    siteNameArabic: { type: String, default: "يعلم" },
    siteTagline: { type: String, default: "Learn Without Limits" },

    logo: {
      isVisible: { type: Boolean, default: true },
      text: {
        mark: { type: String, default: "ي" },
        name: { type: String, default: "Yaclam" },
        highlight: { type: String, default: "." },
        isVisible: { type: Boolean, default: true },
      },
      picture: {
        light: { type: String, default: "" },
        dark: { type: String, default: "" },
        alt: { type: String, default: "Yaclam" },
        isVisible: { type: Boolean, default: true },
      },
    },

    favicon: { type: String, default: "" },

    contact: {
      email: { type: String, default: "hello@yaclam.com" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
    },

    socials: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },

    seo: {
      title: { type: String, default: "Yaclam (يعلم) — Learn Without Limits" },
      description: { type: String, default: "" },
      keywords: [{ type: String }],
    },

    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

settingsSchema.plugin(toJSON);
module.exports = mongoose.model("Settings", settingsSchema, "settings");
