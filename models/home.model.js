const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");
const { buttonSchema, statItemSchema } = require("./schemas/button.schema");

const homeSchema = new mongoose.Schema(
  {
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },

    heroBadgeText: { type: String, default: "AI-Powered Somali E-Learning" },
    heroTitle: { type: String, default: "Learn Skills. Build Careers. Create Opportunities." },
    heroSubtitle: {
      type: String,
      default:
        "Master practical skills, earn certificates, discover scholarships, and advance your career through expert-led Somali-language education.",
    },
    heroBrandMark: { type: String, default: "يعلم" },
    heroVerseArabic: { type: String, default: "قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ" },
    heroVerseTranslation: { type: String, default: "Are those who know equal to those who do not know?" },
    heroPrimaryButton: { type: buttonSchema, default: () => ({ label: "Start Learning", url: "/register", isVisible: true }) },
    heroSecondaryButton: { type: buttonSchema, default: () => ({ label: "Explore Courses", url: "/courses", isVisible: true }) },
    heroLearnerCountText: { type: String, default: "Joined by **10,000+** Somali learners" },
    heroShowLearnerAvatars: { type: Boolean, default: true },
    heroIsVisible: { type: Boolean, default: true },

    stats: {
      type: [statItemSchema],
      default: () => [
        { value: "10K+", label: "Learners", isVisible: true },
        { value: "50+", label: "Courses", isVisible: true },
        { value: "200+", label: "Scholarships", isVisible: true },
        { value: "50+", label: "Career Paths", isVisible: true },
        { value: "100+", label: "Certificates", isVisible: true },
      ],
    },
    statsIsVisible: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

homeSchema.plugin(toJSON);
module.exports = mongoose.model("Home", homeSchema);
