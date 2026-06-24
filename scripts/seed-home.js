require("dotenv").config();

const db = require("../config/db");
const Home = require("../models/home.model");

const DEFAULT_HOME = {
  isVisible: true,
  del_status: "Live",
  heroBadgeText: "AI-Powered Somali E-Learning",
  heroTitle: "Learn Skills. Build Careers. Create Opportunities.",
  heroSubtitle:
    "Master practical skills, earn certificates, discover scholarships, and advance your career through expert-led Somali-language education.",
  heroBrandMark: "يعلم",
  heroVerseArabic: "قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ",
  heroVerseTranslation: "Are those who know equal to those who do not know?",
  heroPrimaryButton: { label: "Start Learning", url: "/register", isVisible: true },
  heroSecondaryButton: { label: "Explore Courses", url: "/courses", isVisible: true },
  heroLearnerCountText: "Joined by **10,000+** Somali learners",
  heroShowLearnerAvatars: true,
  heroIsVisible: true,
  stats: [
    { value: "10K+", label: "Learners", isVisible: true },
    { value: "50+", label: "Courses", isVisible: true },
    { value: "200+", label: "Scholarships", isVisible: true },
    { value: "50+", label: "Career Paths", isVisible: true },
    { value: "100+", label: "Certificates", isVisible: true },
  ],
  statsIsVisible: true,
};

async function seedHome() {
  await db.connectDB();

  const existing = await Home.countDocuments({ del_status: "Live" });
  if (existing > 0) {
    console.log(`Home content already exists (${existing} live row(s)). Skipping seed.`);
    process.exit(0);
  }

  await Home.collection.insertOne(DEFAULT_HOME);
  console.log("Home content seeded successfully.");
  process.exit(0);
}

seedHome().catch((err) => {
  console.error("Home seed failed:", err.message);
  process.exit(1);
});
