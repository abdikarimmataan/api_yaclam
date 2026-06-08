const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const pageSectionSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Get in touch" },
    subtitle: {
      type: String,
      default: "Questions about courses, scholarships or partnerships? We'd love to hear from you.",
    },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const contactInfoSectionSchema = new mongoose.Schema(
  {
    icon: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const contactCmsSchema = new mongoose.Schema(
  {
    /** Legacy flat fields — kept for existing clients and page CMS editors */
    title: { type: String, default: "Get in touch" },
    subtitle: {
      type: String,
      default: "Questions about courses, scholarships or partnerships? We'd love to hear from you.",
    },
    emptyStateText: { type: String, default: "" },
    pageSection: {
      type: pageSectionSchema,
      default: () => ({
        title: "Get in touch",
        subtitle: "Questions about courses, scholarships or partnerships? We'd love to hear from you.",
      }),
    },
    emailSection: {
      type: contactInfoSectionSchema,
      default: () => ({
        icon: "Mail",
        title: "Email",
        description: "hello@yaclam.com",
      }),
    },
    phoneSection: {
      type: contactInfoSectionSchema,
      default: () => ({
        icon: "Phone",
        title: "Phone",
        description: "+353 1 234 5678",
      }),
    },
    locationSection: {
      type: contactInfoSectionSchema,
      default: () => ({
        icon: "MapPin",
        title: "Location",
        description: "Dublin, Ireland · Serving learners worldwide",
      }),
    },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

function syncPageSectionWithLegacyFields(doc) {
  const pageSection = doc.pageSection?.toObject?.() ?? doc.pageSection ?? {};

  if (doc.title !== undefined && doc.title !== null && doc.title !== "") {
    pageSection.title = doc.title;
  } else if (pageSection.title) {
    doc.title = pageSection.title;
  }

  if (doc.subtitle !== undefined && doc.subtitle !== null && doc.subtitle !== "") {
    pageSection.subtitle = doc.subtitle;
  } else if (pageSection.subtitle) {
    doc.subtitle = pageSection.subtitle;
  }

  doc.pageSection = pageSection;
}

contactCmsSchema.pre("save", function syncContactCmsFields(next) {
  syncPageSectionWithLegacyFields(this);
  next();
});

contactCmsSchema.plugin(toJSON);
module.exports = mongoose.model("ContactCms", contactCmsSchema, "contact_cms");
