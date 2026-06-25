/**
 * Build university_manages records from seeded universities + programs.
 * Run: node scripts/seed-university-manages.js
 * Or via: npm run seed:universities (included at the end)
 */
require("dotenv").config();

const mongoose = require("mongoose");
require("../models/country.model");
const University = require("../models/university.model");
const UniversityManage = require("../models/university_manage.model");
const UniversityProgram = require("../models/university_program.model");
const UniversityDiscipline = require("../models/university_discipline.model");
const UniversityCategory = require("../models/university_category.model");
const UniversityLanguage = require("../models/university_language.model");
const {
  syncManageOfferingsToUniversity,
} = require("../utilities/university_manage.utility");
const { universities } = require("./seed-universities.data");

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

function splitLanguages(languageText) {
  return String(languageText || "")
    .split(/\s*\/\s*|\s*,\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function uniqueProgramNamesFromSeed() {
  const courses = new Set();
  const fields = new Set();
  for (const university of universities) {
    for (const program of university.programs || []) {
      const course = String(program.course ?? "").trim();
      const field = String(program.field ?? "").trim();
      if (course) courses.add(course);
      if (field) fields.add(field);
    }
  }
  return { courses: [...courses], fields: [...fields] };
}

async function upsertNamedRows(Model, names) {
  let created = 0;
  for (const name of names) {
    const result = await Model.updateOne(
      { name, del_status: "Live" },
      { $setOnInsert: { name, isVisible: true, del_status: "Live" } },
      { upsert: true }
    );
    if (result.upsertedCount) created += 1;
  }
  return created;
}

async function ensureStudyAreaAndDisciplineLookups() {
  const { courses, fields } = uniqueProgramNamesFromSeed();
  const disciplineNames = [...new Set([...DISCIPLINE_NAMES, ...fields])];

  const studyAreasCreated = await upsertNamedRows(UniversityProgram, courses);
  const disciplinesCreated = await upsertNamedRows(UniversityDiscipline, disciplineNames);

  return {
    studyAreas: courses.length,
    studyAreasCreated,
    disciplines: disciplineNames.length,
    disciplinesCreated,
  };
}

async function loadLookupMaps() {
  const [studyAreas, disciplines, categories, languages] = await Promise.all([
    UniversityProgram.find({ del_status: "Live" }).select("name"),
    UniversityDiscipline.find({ del_status: "Live" }).select("name"),
    UniversityCategory.find({ del_status: "Live" }).select("name"),
    UniversityLanguage.find({ del_status: "Live" }).select("name"),
  ]);

  const studyAreaByName = new Map(
    studyAreas.map((row) => [String(row.name).toLowerCase(), row._id])
  );
  const disciplineByName = new Map(
    disciplines.map((row) => [String(row.name).toLowerCase(), row._id])
  );
  const categoryByName = new Map(
    categories.map((row) => [String(row.name).toLowerCase(), row._id])
  );
  const languageByName = new Map(
    languages.map((row) => [String(row.name).toLowerCase(), row._id])
  );

  return { studyAreaByName, disciplineByName, categoryByName, languageByName };
}

function resolveLanguageIds(program, languageByName) {
  const ids = new Set();
  for (const languageName of splitLanguages(program.language)) {
    const id = languageByName.get(languageName.toLowerCase());
    if (id) ids.add(id);
  }
  return [...ids];
}

function offeringsFromPrograms(programs, maps, university) {
  const rows = [];

  for (const program of programs || []) {
    const course = String(program.course ?? "").trim();
    const level = String(program.level ?? "").trim();
    if (!course || !level) continue;

    const studyAreaId = maps.studyAreaByName.get(course.toLowerCase());
    const categoryId = maps.categoryByName.get(level.toLowerCase());
    if (!studyAreaId || !categoryId) continue;

    const field = String(program.field ?? "").trim();
    const disciplineId = field
      ? maps.disciplineByName.get(field.toLowerCase()) || null
      : null;

    rows.push({
      studyAreaId,
      disciplineId,
      categoryId,
      year: String(program.duration ?? "").trim(),
      languageIds: resolveLanguageIds(program, maps.languageByName),
      feePerYear: String(program.tuition ?? "").trim(),
      website:
        program.link && program.link !== "#"
          ? String(program.link).trim()
          : String(university.website ?? "").trim(),
    });
  }

  return rows;
}

async function seedUniversityManagesFromDb() {
  const maps = await loadLookupMaps();
  const universityRows = await University.find({ del_status: "Live" }).select(
    "name programs website"
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const university of universityRows) {
    const offerings = offeringsFromPrograms(university.programs, maps, university);
    if (!offerings.length) {
      skipped += 1;
      continue;
    }

    const existing = await UniversityManage.findOne({
      universityId: university._id,
      del_status: "Live",
    });

    if (existing) {
      existing.offerings = offerings;
      await existing.save();
      await syncManageOfferingsToUniversity(university._id, offerings);
      updated += 1;
    } else {
      await UniversityManage.create({
        universityId: university._id,
        offerings,
        del_status: "Live",
      });
      await syncManageOfferingsToUniversity(university._id, offerings);
      created += 1;
    }
  }

  return {
    totalUniversities: universityRows.length,
    created,
    updated,
    skipped,
  };
}

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGO_URI not set");
  await mongoose.connect(uri);

  const lookups = await ensureStudyAreaAndDisciplineLookups();
  const result = await seedUniversityManagesFromDb();

  console.log("University manage seed done.");
  console.log(
    `  Lookups: ${lookups.studyAreas} study areas (${lookups.studyAreasCreated} new), ${lookups.disciplines} disciplines (${lookups.disciplinesCreated} new)`
  );
  console.log(
    `  Manage records: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped (${result.totalUniversities} universities scanned)`
  );

  await mongoose.disconnect();
}

module.exports = {
  ensureStudyAreaAndDisciplineLookups,
  seedUniversityManagesFromDb,
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
