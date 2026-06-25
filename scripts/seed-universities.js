require("dotenv").config();

const db = require("../config/db");
const Country = require("../models/country.model");
const UniversityCategory = require("../models/university_category.model");
const UniversityLanguage = require("../models/university_language.model");
const UniversityLocation = require("../models/university_location.model");
const University = require("../models/university.model");
const UniversityCms = require("../models/university_cms.model");
const { normalizePrograms } = require("../utilities/university.utility");
const {
  ensureStudyAreaAndDisciplineLookups,
  seedUniversityManagesFromDb,
} = require("./seed-university-manages");
const { LEVEL_TABS, universities } = require("./seed-universities.data");

const COUNTRY_ALIASES = {
  Türkiye: "Turkey",
};

function normalizeCountryName(name) {
  const trimmed = String(name || "").trim();
  return COUNTRY_ALIASES[trimmed] || trimmed;
}

function splitLanguages(languageText) {
  return String(languageText || "")
    .split(/\s*\/\s*|\s*,\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function pickFeePerYear(programs = []) {
  const withYearly = programs.find((program) => /\/yr/i.test(program.tuition || ""));
  if (withYearly) return withYearly.tuition;
  const first = programs.find((program) => program.tuition);
  return first?.tuition || "";
}

function pickPrimaryDuration(programs = []) {
  const bachelor = programs.find((program) => program.level === "Bachelor" && program.duration);
  if (bachelor) return bachelor.duration;
  const first = programs.find((program) => program.duration);
  return first?.duration || "";
}

function uniqueLanguageStrings(universityList) {
  const set = new Set();
  for (const university of universityList) {
    for (const program of university.programs || []) {
      splitLanguages(program.language).forEach((lang) => set.add(lang));
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

function uniqueLocations(universityList) {
  const map = new Map();
  for (const university of universityList) {
    const country = normalizeCountryName(university.country);
    const city = String(university.city || "").trim();
    if (!country || !city) continue;
    map.set(`${city}::${country}`, { city, country });
  }
  return [...map.values()];
}

async function loadCountryMap() {
  const countries = await Country.find({ del_status: "Live" }).select("name");
  const byName = new Map(countries.map((country) => [country.name.toLowerCase(), country._id]));

  for (const [alias, canonical] of Object.entries(COUNTRY_ALIASES)) {
    const id = byName.get(canonical.toLowerCase());
    if (id) byName.set(alias.toLowerCase(), id);
  }

  return byName;
}

async function seedCategories() {
  let upserted = 0;
  for (const tab of LEVEL_TABS) {
    const result = await UniversityCategory.updateOne(
      { name: tab.id, del_status: "Live" },
      {
        $set: {
          name: tab.id,
          isVisible: true,
          del_status: "Live",
          created_by: "seed",
        },
      },
      { upsert: true }
    );
    if (result.upsertedCount) upserted += 1;
  }
  return upserted;
}

async function seedLocations(countryMap) {
  const locations = uniqueLocations(universities);
  const locationMap = new Map();
  let upserted = 0;

  for (const { city, country } of locations) {
    const countryId = countryMap.get(country.toLowerCase());
    if (!countryId) {
      console.warn(`Skipping location ${city}, ${country} — country not found in DB`);
      continue;
    }

    const doc = await UniversityLocation.findOneAndUpdate(
      { name: city, countryId, del_status: "Live" },
      {
        $set: {
          name: city,
          countryId,
          isVisible: true,
          del_status: "Live",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    locationMap.set(`${city}::${country}`, doc._id);
    upserted += 1;
  }

  return { locationMap, count: upserted };
}

async function seedLanguages(countryMap, universityList) {
  const languageMap = new Map();
  let upserted = 0;

  for (const languageName of uniqueLanguageStrings(universityList)) {
    let countryId = null;
    outer: for (const university of universityList) {
      const normalizedCountry = normalizeCountryName(university.country);
      const countryKey = normalizedCountry.toLowerCase();
      for (const program of university.programs || []) {
        if (splitLanguages(program.language).includes(languageName)) {
          countryId = countryMap.get(countryKey) || null;
          break outer;
        }
      }
    }

    const doc = await UniversityLanguage.findOneAndUpdate(
      { name: languageName, countryId: countryId || null, del_status: "Live" },
      {
        $set: {
          name: languageName,
          countryId,
          isVisible: true,
          del_status: "Live",
          created_by: "seed",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    languageMap.set(languageName.toLowerCase(), doc._id);
    upserted += 1;
  }

  return { languageMap, count: upserted };
}

function resolveLanguageIds(programs, languageMap) {
  const ids = new Set();
  for (const program of programs || []) {
    for (const languageName of splitLanguages(program.language)) {
      const id = languageMap.get(languageName.toLowerCase());
      if (id) ids.add(String(id));
    }
  }
  return [...ids];
}

function resolveUniversityYear(source, programs) {
  if (source.year != null && String(source.year).trim()) {
    return String(source.year).trim();
  }
  return pickPrimaryDuration(programs);
}

async function seedUniversities(countryMap, locationMap, languageMap) {
  let upserted = 0;
  let updated = 0;

  for (let index = 0; index < universities.length; index += 1) {
    const source = universities[index];
    const country = normalizeCountryName(source.country);
    const city = String(source.city || "").trim();
    const locationId = locationMap.get(`${city}::${country}`) || null;
    const programs = normalizePrograms(source.programs).map((program) => ({
      ...program,
      link: program.link && program.link !== "#" ? program.link : source.website || "",
    }));

    const payload = {
      name: source.name,
      slug: source.slug || "",
      country,
      region: source.region || "",
      city,
      flag: source.flag || "",
      ranking: source.ranking || "",
      programs,
      locationId,
      year: resolveUniversityYear(source, programs),
      languageIds: resolveLanguageIds(programs, languageMap),
      feePerYear: pickFeePerYear(programs),
      website: source.website || "",
      sortOrder: index + 1,
      isPublished: true,
      isVisible: true,
      del_status: "Live",
    };

    const existing = await University.findOne({ name: source.name, del_status: "Live" });
    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      updated += 1;
    } else {
      await University.create(payload);
      upserted += 1;
    }
  }

  return { upserted, updated };
}

async function seedUniversityCms() {
  const existing = await UniversityCms.countDocuments({ del_status: "Live" });
  if (existing > 0) return 0;

  await UniversityCms.create({
    title: "Universities",
    subtitle:
      "Find universities and the courses they offer — Bachelor, Master, PhD, research and internships — with the scholarships that fund them.",
    emptyStateText: "No universities found.",
    isVisible: true,
    del_status: "Live",
  });
  return 1;
}

async function seedUniversitiesAll() {
  await db.connectDB();

  const countryMap = await loadCountryMap();
  const categories = await seedCategories();
  const { locationMap, count: locationCount } = await seedLocations(countryMap);
  const { languageMap, count: languageCount } = await seedLanguages(countryMap, universities);
  const { upserted, updated } = await seedUniversities(countryMap, locationMap, languageMap);
  const cmsCreated = await seedUniversityCms();
  const lookups = await ensureStudyAreaAndDisciplineLookups();
  const manageResult = await seedUniversityManagesFromDb();

  console.log("Universities seed complete:");
  console.log(`  Categories: ${LEVEL_TABS.length} (${categories} new)`);
  console.log(`  Locations: ${locationCount}`);
  console.log(`  Languages: ${languageCount}`);
  console.log(`  Universities: ${universities.length} total (${upserted} inserted, ${updated} updated)`);
  console.log(`  University CMS: ${cmsCreated ? "created" : "already exists"}`);
  console.log(
    `  Study areas: ${lookups.studyAreas} (${lookups.studyAreasCreated} new) · Disciplines: ${lookups.disciplines} (${lookups.disciplinesCreated} new)`
  );
  console.log(
    `  Manage records: ${manageResult.created} created, ${manageResult.updated} updated, ${manageResult.skipped} skipped`
  );

  process.exit(0);
}

seedUniversitiesAll().catch((err) => {
  console.error("Universities seed failed:", err.message);
  process.exit(1);
});
