/**
 * Seed university discipline names (program.field groups on /universities).
 * Run: node scripts/seed-university-disciplines.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const UniversityDiscipline = require("../models/university_discipline.model");

const DISCIPLINE_NAMES = [
  "Computing & IT",
  "Health & Medicine",
  "Humanities",
  "Business & Management",
  "Engineering",
  "Education",
  "Sciences",
  "Social Sciences",
  "General",
];

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGO_URI not set");
  await mongoose.connect(uri);

  let created = 0;
  for (const name of DISCIPLINE_NAMES) {
    const result = await UniversityDiscipline.updateOne(
      { name, del_status: "Live" },
      { $setOnInsert: { name, isVisible: true, del_status: "Live" } },
      { upsert: true }
    );
    if (result.upsertedCount) created += 1;
  }

  console.log(`University disciplines seed done. Created ${created}, total names ${DISCIPLINE_NAMES.length}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
