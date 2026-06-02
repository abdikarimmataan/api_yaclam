const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const linkSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    url: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const footerColumnSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    links: [linkSchema],
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const footerSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Yaclam" },
    siteNameArabic: { type: String, default: "يعلم" },

    logo: {
      isVisible: { type: Boolean, default: true },
      text: {
        mark: { type: String, default: "ي" },
        name: { type: String, default: "Yaclam" },
        highlight: { type: String, default: "." },
        isVisible: { type: Boolean, default: true },
      },
    },

    socials: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },

    footer: {
      description: { type: String, default: "" },
      copyright: { type: String, default: "© 2026 Yaclam (يعلم). All rights reserved." },
      tagline: { type: String, default: "" },
      columns: [footerColumnSchema],
    },

    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

footerSchema.plugin(toJSON);
module.exports = mongoose.model("Footer", footerSchema, "footers");
