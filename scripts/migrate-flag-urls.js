require("dotenv").config();

const db = require("../config/db");
const Country = require("../models/country.model");
const Scholarship = require("../models/scholarship.model");
const { buildFlagIconUrl } = require("../utilities/country.utility");

async function migrateFlags() {
  await db.connectDB();

  const countries = await Country.find({ del_status: "Live" }).lean();
  const flagByName = new Map(
    countries.map((country) => [country.name, buildFlagIconUrl(country.code ?? "")])
  );

  let countryUpdates = 0;
  for (const country of countries) {
    const nextFlag = buildFlagIconUrl(country.code ?? "");
    if (country.flag !== nextFlag) {
      await Country.updateOne({ _id: country._id }, { $set: { flag: nextFlag } });
      countryUpdates += 1;
    }
  }

  const scholarships = await Scholarship.find({ del_status: "Live" }).lean();
  let scholarshipUpdates = 0;
  for (const scholarship of scholarships) {
    const countryName = String(scholarship.country ?? "").trim();
    const nextFlag = countryName ? flagByName.get(countryName) : "";
    if (!nextFlag || scholarship.flag === nextFlag) continue;
    await Scholarship.updateOne({ _id: scholarship._id }, { $set: { flag: nextFlag } });
    scholarshipUpdates += 1;
  }

  console.log(
    `Flag migration complete: ${countryUpdates} countries updated, ${scholarshipUpdates} scholarships updated.`
  );
  process.exit(0);
}

migrateFlags().catch((err) => {
  console.error("Flag migration failed:", err.message);
  process.exit(1);
});
