/**
 * Seed university program names (course groups on /universities).
 * Run: node scripts/seed-university-programs.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const UniversityProgram = require("../models/university_program.model");

const PROGRAM_NAMES = [
  "Computer Science & IT",
  "Computer Science",
  "Computer Science & AI",
  "Information Technology",
  "Software Engineering",
  "Computer Engineering",
  "Data Science",
  "Data Science & Engineering",
  "Data Engineering & Analytics",
  "Artificial Intelligence",
  "Machine Learning",
  "Business Administration",
  "International Business",
  "Business Analytics",
  "Banking & Finance",
  "Accounting",
  "Economics",
  "Economics & Management",
  "MBA",
  "Medicine",
  "Medicine & Surgery",
  "Nursing",
  "Public Health",
  "Pharmacy",
  "Medical Laboratory Sciences",
  "Law",
  "Sharia & Law",
  "Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Software Engineering",
  "Telecommunications",
  "Architecture",
  "Education",
  "International Relations",
  "Political Science",
  "Journalism",
  "Mass Communication",
  "Agriculture",
  "Veterinary Medicine",
  "Islamic Studies",
  "Mathematics",
  "Physics Research",
  "MSc Networking & Data Communications",
];

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGO_URI not set");
  await mongoose.connect(uri);

  let created = 0;
  for (const name of PROGRAM_NAMES) {
    const result = await UniversityProgram.updateOne(
      { name, del_status: "Live" },
      { $setOnInsert: { name, isVisible: true, del_status: "Live" } },
      { upsert: true }
    );
    if (result.upsertedCount) created += 1;
  }

  console.log(`University programs seed done. Created ${created}, total names ${PROGRAM_NAMES.length}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
