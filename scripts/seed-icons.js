require("dotenv").config();

const db = require("../config/db");
const Icon = require("../models/icon.model");

const ICONS = [
  // About page (mission, vision, values, ecosystem)
  { name: "Target", label: "Target" },
  { name: "Globe", label: "Globe" },
  { name: "ShieldCheck", label: "Shield Check" },
  { name: "Layers", label: "Layers" },

  // Contact page
  { name: "Mail", label: "Mail" },
  { name: "Phone", label: "Phone" },
  { name: "MapPin", label: "Map Pin" },

  // Fields, roadmaps, why-yaclam (frontend icon-map)
  { name: "Award", label: "Award" },
  { name: "BarChart3", label: "Bar Chart" },
  { name: "Brain", label: "Brain" },
  { name: "Briefcase", label: "Briefcase" },
  { name: "BookOpen", label: "Book Open" },
  { name: "ClipboardList", label: "Clipboard List" },
  { name: "Cloud", label: "Cloud" },
  { name: "Code2", label: "Code" },
  { name: "Cpu", label: "CPU" },
  { name: "Database", label: "Database" },
  { name: "DollarSign", label: "Dollar Sign" },
  { name: "GitBranch", label: "Git Branch" },
  { name: "GraduationCap", label: "Graduation Cap" },
  { name: "Image", label: "Image" },
  { name: "Layout", label: "Layout" },
  { name: "LineChart", label: "Line Chart" },
  { name: "Lock", label: "Lock" },
  { name: "Megaphone", label: "Megaphone" },
  { name: "PenTool", label: "Pen Tool" },
  { name: "Rocket", label: "Rocket" },
  { name: "Settings", label: "Settings" },
  { name: "Smartphone", label: "Smartphone" },
  { name: "TrendingUp", label: "Trending Up" },

  // Legacy / alias support
  { name: "ChartBar", label: "Chart Bar" },

  // General CMS extras
  { name: "Calendar", label: "Calendar" },
  { name: "Clock", label: "Clock" },
  { name: "Code", label: "Code Brackets" },
  { name: "FileText", label: "File Text" },
  { name: "Laptop", label: "Laptop" },
  { name: "Lightbulb", label: "Lightbulb" },
  { name: "Map", label: "Map" },
  { name: "MessageCircle", label: "Message Circle" },
  { name: "Monitor", label: "Monitor" },
  { name: "PieChart", label: "Pie Chart" },
  { name: "Shield", label: "Shield" },
  { name: "Star", label: "Star" },
  { name: "Trophy", label: "Trophy" },
  { name: "User", label: "User" },
  { name: "Users", label: "Users" },
  { name: "Video", label: "Video" },
];

async function seedIcons() {
  await db.connectDB();

  const ops = ICONS.map((icon) => ({
    updateOne: {
      filter: { name: icon.name },
      update: {
        $set: {
          name: icon.name,
          label: icon.label || icon.name,
          isVisible: true,
          del_status: "Live",
        },
      },
      upsert: true,
    },
  }));

  const result = await Icon.bulkWrite(ops);
  const upserted = result.upsertedCount ?? 0;
  const modified = result.modifiedCount ?? 0;

  console.log(`Icons seeded: ${ICONS.length} total (${upserted} inserted, ${modified} updated).`);
  process.exit(0);
}

seedIcons().catch((err) => {
  console.error("Icon seed failed:", err.message);
  process.exit(1);
});
