const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const sectionTextSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    cardNumberVisible: { type: Number, default: 5, min: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const sectionButtonSchema = new mongoose.Schema(
  {
    text: { type: String, default: "" },
    url: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const featuredCoursesSectionSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    cardNumberVisible: { type: Number, default: 5, min: 0 },
    isVisible: { type: Boolean, default: true },
    viewAllButton: {
      type: sectionButtonSchema,
      default: () => ({ text: "View all", url: "/courses", isVisible: true }),
    },
  },
  { _id: false }
);

const roadmapsSectionSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    cardNumberVisible: { type: Number, default: 5, min: 0 },
    isVisible: { type: Boolean, default: true },
    allRoadmapsButton: {
      type: sectionButtonSchema,
      default: () => ({ text: "All roadmaps", url: "/roadmaps", isVisible: true }),
    },
  },
  { _id: false }
);

const scholarshipsSectionSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    cardNumberVisible: { type: Number, default: 5, min: 0 },
    isVisible: { type: Boolean, default: true },
    browseAllButton: {
      type: sectionButtonSchema,
      default: () => ({ text: "Browse all", url: "/scholarships", isVisible: true }),
    },
  },
  { _id: false }
);

const ctaSectionSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    primaryButton: {
      type: sectionButtonSchema,
      default: () => ({ text: "Create free account", url: "/register", isVisible: true }),
    },
    secondaryButton: {
      type: sectionButtonSchema,
      default: () => ({ text: "Browse courses", url: "/courses", isVisible: true }),
    },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const homeSectionsSchema = new mongoose.Schema(
  {
    fieldSection: {
      type: sectionTextSchema,
      default: () => ({
        eyebrow: "Browse",
        title: "Find your field",
        subtitle: "Explore practical, job-ready skills across the disciplines that matter most.",
      }),
    },
    featuredCoursesSection: {
      type: featuredCoursesSectionSchema,
      default: () => ({
        eyebrow: "Popular",
        title: "Featured courses",
        subtitle: "Hand-picked, top-rated programmes loved by thousands of learners.",
        viewAllButton: { text: "View all", url: "/courses", isVisible: true },
      }),
    },
    whyYaclamSection: {
      type: sectionTextSchema,
      default: () => ({
        eyebrow: "Why Yaclam",
        title: "Education built for you",
        subtitle: "Everything you need to learn, get certified and move your career forward.",
      }),
    },
    roadmapsSection: {
      type: roadmapsSectionSchema,
      default: () => ({
        eyebrow: "Career Roadmaps",
        title: "Your path to a career",
        subtitle: "Salary data, in-demand skills and a guided learning sequence for every role.",
        allRoadmapsButton: { text: "All roadmaps", url: "/roadmaps", isVisible: true },
      }),
    },
    scholarshipsSection: {
      type: scholarshipsSectionSchema,
      default: () => ({
        eyebrow: "Funded Futures",
        title: "Scholarships database",
        subtitle: "Fully and partially funded opportunities, updated and explained — apply with confidence.",
        browseAllButton: { text: "Browse all", url: "/scholarships", isVisible: true },
      }),
    },
    practitionersSection: {
      type: sectionTextSchema,
      default: () => ({
        eyebrow: "Expert-led",
        title: "Learn from practitioners",
        subtitle: "Our instructors teach what they actually do — no theory without practice.",
      }),
    },
    testimonialsSection: {
      type: sectionTextSchema,
      default: () => ({
        eyebrow: "Learners",
        title: "Real outcomes",
        subtitle: "From first lesson to first job offer — here is what learners say.",
      }),
    },
    ctaSection: {
      type: ctaSectionSchema,
      default: () => ({
        title: "Your future is one decision away",
        subtitle:
          "Join thousands of Somali learners building skills, earning certificates and changing their lives. Start free today.",
        primaryButton: { text: "Create free account", url: "/register", isVisible: true },
        secondaryButton: { text: "Browse courses", url: "/courses", isVisible: true },
      }),
    },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

homeSectionsSchema.plugin(toJSON);
module.exports = mongoose.model("HomeSections", homeSectionsSchema, "home_sections");
