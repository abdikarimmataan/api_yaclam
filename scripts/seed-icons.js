require("dotenv").config();

const db = require("../config/db");
const Icon = require("../models/icon.model");

const ICONS = [
  { name: "Globe", label: "Globe" },
  { name: "BookOpen", label: "Book Open" },
  { name: "GraduationCap", label: "Graduation Cap" },
  { name: "BarChart3", label: "Bar Chart" },
  { name: "ChartBar", label: "Chart Bar" },
  { name: "Code", label: "Code" },
  { name: "Database", label: "Database" },
  { name: "Laptop", label: "Laptop" },
  { name: "Monitor", label: "Monitor" },
  { name: "Users", label: "Users" },
  { name: "User", label: "User" },
  { name: "Award", label: "Award" },
  { name: "Trophy", label: "Trophy" },
  { name: "Star", label: "Star" },
  { name: "Lightbulb", label: "Lightbulb" },
  { name: "Rocket", label: "Rocket" },
  { name: "Target", label: "Target" },
  { name: "TrendingUp", label: "Trending Up" },
  { name: "Briefcase", label: "Briefcase" },
  { name: "Calendar", label: "Calendar" },
  { name: "Clock", label: "Clock" },
  { name: "FileText", label: "File Text" },
  { name: "Layers", label: "Layers" },
  { name: "Map", label: "Map" },
  { name: "MessageCircle", label: "Message Circle" },
  { name: "PenTool", label: "Pen Tool" },
  { name: "PieChart", label: "Pie Chart" },
  { name: "Settings", label: "Settings" },
  { name: "Shield", label: "Shield" },
  { name: "Video", label: "Video" },
];

async function seedIcons() {
  await db.connectDB();

  const existing = await Icon.countDocuments({ del_status: "Live" });
  if (existing > 0) {
    console.log(`Icons already seeded (${existing} live records). Skipping.`);
    process.exit(0);
  }

  await Icon.insertMany(
    ICONS.map((icon) => ({
      ...icon,
      isVisible: true,
      del_status: "Live",
    }))
  );

  console.log(`Seeded ${ICONS.length} icons.`);
  process.exit(0);
}

seedIcons().catch((err) => {
  console.error("Icon seed failed:", err.message);
  process.exit(1);
});
