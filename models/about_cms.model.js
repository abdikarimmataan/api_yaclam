const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const sectionButtonSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    url: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const pageSectionSchema = new mongoose.Schema(
  {
    title: { type: String, default: "About Yaclam" },
    subtitle: {
      type: String,
      default:
        "The largest Somali-language learning ecosystem — built to make world-class education accessible in the language learners understand best.",
    },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const ourStorySectionSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "Our Story" },
    title: { type: String, default: "Knowledge, in your language." },
    description: {
      type: String,
      default:
        "Yaclam (يعلم) exists because talent is everywhere, but access is not. Millions of Somali learners are held back not by ability, but by a lack of high-quality education in a language they fully understand.\n\nWe teach practical, job-ready skills — data, technology, finance, design — alongside the scholarship and career guidance learners need to turn knowledge into opportunity, wherever they are in the world.",
    },
    button: {
      type: sectionButtonSchema,
      default: () => ({ name: "Join Yaclam", url: "/register", isVisible: true }),
    },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const iconCardSectionSchema = new mongoose.Schema(
  {
    icon: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const verseSectionSchema = new mongoose.Schema(
  {
    verseArabic: {
      type: String,
      default: "قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ",
    },
    verseTranslation: {
      type: String,
      default: "Are those who know equal to those who do not know?",
    },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const aboutCmsSchema = new mongoose.Schema(
  {
    /** Legacy flat fields — kept for existing clients and admin editors using page CMS shape */
    title: { type: String, default: "About Yaclam" },
    subtitle: {
      type: String,
      default:
        "The largest Somali-language learning ecosystem — built to make world-class education accessible in the language learners understand best.",
    },
    emptyStateText: { type: String, default: "" },
    pageSection: {
      type: pageSectionSchema,
      default: () => ({
        title: "About Yaclam",
        subtitle:
          "The largest Somali-language learning ecosystem — built to make world-class education accessible in the language learners understand best.",
      }),
    },
    ourStorySection: {
      type: ourStorySectionSchema,
      default: () => ({
        eyebrow: "Our Story",
        title: "Knowledge, in your language.",
        description:
          "Yaclam (يعلم) exists because talent is everywhere, but access is not. Millions of Somali learners are held back not by ability, but by a lack of high-quality education in a language they fully understand.\n\nWe teach practical, job-ready skills — data, technology, finance, design — alongside the scholarship and career guidance learners need to turn knowledge into opportunity, wherever they are in the world.",
        button: { name: "Join Yaclam", url: "/register", isVisible: true },
      }),
    },
    missionSection: {
      type: iconCardSectionSchema,
      default: () => ({
        icon: "Target",
        title: "Mission",
        description:
          "Empower Somali learners worldwide through accessible, high-quality education delivered in the language they understand best.",
      }),
    },
    visionSection: {
      type: iconCardSectionSchema,
      default: () => ({
        icon: "Globe",
        title: "Vision",
        description: "Become the largest Somali-language learning platform and digital education ecosystem globally.",
      }),
    },
    valuesSection: {
      type: iconCardSectionSchema,
      default: () => ({
        icon: "ShieldCheck",
        title: "Values",
        description: "Quality without compromise, dignity in access, and lasting impact for communities.",
      }),
    },
    ecosystemSection: {
      type: iconCardSectionSchema,
      default: () => ({
        icon: "Layers",
        title: "Ecosystem",
        description: "Courses, scholarships, roadmaps and certificates — everything in one trusted place.",
      }),
    },
    verseSection: {
      type: verseSectionSchema,
      default: () => ({
        verseArabic: "قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ",
        verseTranslation: "Are those who know equal to those who do not know?",
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

aboutCmsSchema.pre("save", function syncAboutCmsFields(next) {
  syncPageSectionWithLegacyFields(this);
  next();
});

aboutCmsSchema.plugin(toJSON);
module.exports = mongoose.model("AboutCms", aboutCmsSchema, "about_cms");
