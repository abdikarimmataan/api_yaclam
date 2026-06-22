const mongoose = require("mongoose");
const { computeCurriculumStats } = require("../utilities/course-curriculum-stats.utility");
const { toJSON } = require("../utilities/toJson.utility");
const { parseMoney } = require("../utilities/money.utility");

const buttonSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    url: { type: String, default: "" },
    style: { type: String, default: "primary" },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: "" },
    duration: { type: String, default: "" },
    free: { type: Boolean, default: false },
    lessonType: { type: String, enum: ["video", "link"], default: "video" },
    videoUrl: { type: String, default: "" },
    linkUrl: { type: String, default: "" },
    vimeoId: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    lessons: { type: [lessonSchema], default: [] },
  },
  { _id: false }
);

const overviewSchema = new mongoose.Schema(
  {
    headline: { type: String, default: "Build smarter, not harder" },
    description: { type: String, default: "" },
    outcomes: { type: [String], default: [] },
  },
  { _id: false }
);

const detailsSchema = new mongoose.Schema(
  {
    skillLevel: { type: String, default: "Beginner" },
    language: { type: String, default: "Somali" },
    durationHours: { type: Number, default: 0 },
    lessonCount: { type: Number, default: 0 },
    certificate: { type: Boolean, default: true },
    access: { type: String, default: "1 Year" },
  },
  { _id: false }
);

const resourceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const instructorSchema = new mongoose.Schema(
  {
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, default: "" },
    role: { type: String, default: "Practitioner-instructor" },
    bio: {
      type: String,
      default:
        "Practitioner-instructor with years of real-world experience, teaching the exact skills employers test for — explained in Somali with English technical terms.",
    },
    avatar: { type: String, default: "" },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    category: { type: String, default: "" },
    fieldId: { type: mongoose.Schema.Types.ObjectId, ref: "Field", default: null },
    level: { type: String, default: "Beginner" },
    language: { type: String, default: "Somali" },
    duration: { type: String, default: "" },
    color: { type: String, default: "#1F3A93" },
    badge: { type: String, default: "" },
    certificate: { type: Boolean, default: true },
    access: { type: String, default: "1 Year" },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    instructorName: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    previewVideoUrl: { type: String, default: "" },
    price: { type: mongoose.Schema.Types.Double, default: 0, set: parseMoney },
    originalPrice: { type: mongoose.Schema.Types.Double, default: 0, set: parseMoney },
    isFree: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    durationHours: { type: Number, default: 0 },
    lessonCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    studentCount: { type: Number, default: 0 },
    overview: {
      type: overviewSchema,
      default: () => ({
        headline: "Build smarter, not harder",
        description: "",
        outcomes: [],
      }),
    },
    curriculum: { type: [moduleSchema], default: [] },
    resources: { type: [resourceSchema], default: [] },
    details: {
      type: detailsSchema,
      default: () => ({
        skillLevel: "Beginner",
        language: "Somali",
        durationHours: 0,
        lessonCount: 0,
        certificate: true,
        access: "1 Year",
      }),
    },
    instructor: {
      type: instructorSchema,
      default: () => ({
        name: "",
        role: "Practitioner-instructor",
        bio: "Practitioner-instructor with years of real-world experience, teaching the exact skills employers test for — explained in Somali with English technical terms.",
        avatar: "",
      }),
    },
    badges: {
      premium: { text: { type: String, default: "PREMIUM" }, isVisible: { type: Boolean, default: true } },
      free: { text: { type: String, default: "FREE" }, isVisible: { type: Boolean, default: true } },
    },
    ctaButton: {
      type: buttonSchema,
      default: () => ({ label: "Buy", isVisible: true }),
    },
    wishlistButton: { isVisible: { type: Boolean, default: true } },
    sortOrder: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

courseSchema.pre("save", function syncNestedFromFlat(next) {
  if (!this.overview) this.overview = {};
  if (this.description && !this.overview.description) {
    this.overview.description = this.description;
  }
  if (this.overview.description && !this.description) {
    this.description = this.overview.description;
  }

  if (!this.details) this.details = {};
  if (this.level) this.details.skillLevel = this.level;
  if (this.durationHours) this.details.durationHours = this.durationHours;
  if (this.language) this.details.language = this.language;
  if (this.lessonCount) this.details.lessonCount = this.lessonCount;
  if (this.certificate != null) this.details.certificate = this.certificate;
  if (this.access) this.details.access = this.access;

  if (!this.instructor) this.instructor = {};
  if (this.instructorName && !this.instructor.name) {
    this.instructor.name = this.instructorName;
  }
  if (this.instructor?.name && !this.instructorName) {
    this.instructorName = this.instructor.name;
  }
  if (this.instructorId && !this.instructor.instructorId) {
    this.instructor.instructorId = this.instructorId;
  }

  if (Array.isArray(this.curriculum)) {
    const stats = computeCurriculumStats(this.curriculum);
    this.lessonCount = stats.lessonCount;
    this.durationHours = stats.durationHours;
    if (!this.details) this.details = {};
    this.details.lessonCount = stats.lessonCount;
    this.details.durationHours = stats.durationHours;
    if (stats.durationHours > 0) {
      this.duration = `${stats.durationHours} hours`;
    }
  }

  next();
});

courseSchema.plugin(toJSON);

const Course = mongoose.model("Course", courseSchema, "courses");

async function syncCourseTitleIndex() {
  if (mongoose.connection.readyState !== 1) return;

  const collection = mongoose.connection.collection("courses");
  try {
    const indexes = await collection.indexes();
    for (const index of indexes) {
      if (index.key?.title === 1 && index.unique) {
        await collection.dropIndex(index.name);
      }
    }
  } catch (_) {
    // legacy unique index may already be removed
  }

  try {
    await Course.syncIndexes();
  } catch (_) {
    // non-unique title index is optional
  }
}

if (mongoose.connection.readyState === 1) {
  syncCourseTitleIndex();
} else {
  mongoose.connection.once("connected", syncCourseTitleIndex);
}

module.exports = Course;
