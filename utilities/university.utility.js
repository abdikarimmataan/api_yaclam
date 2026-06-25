const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const UniversityLanguage = require("../models/university_language.model");
const UniversityLocation = require("../models/university_location.model");
const UniversityCategory = require("../models/university_category.model");
const UniversityProgram = require("../models/university_program.model");
const UniversityDiscipline = require("../models/university_discipline.model");
const { buildFlagIconUrl } = require("./country.utility");

function normalizeObjectId(value) {
  if (value == null || value === "") return null;
  const str = String(value).trim();
  if (!str) return null;
  return isValidObjectId(str) ? str : null;
}

function normalizeObjectIdArray(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map(normalizeObjectId).filter(Boolean))];
}

function normalizePrograms(programs) {
  if (!Array.isArray(programs)) return [];
  return programs.map((program) => ({
    course: String(program?.course ?? "").trim(),
    field: String(program?.field ?? "").trim(),
    level: String(program?.level ?? "").trim(),
    duration: String(program?.duration ?? "").trim(),
    language: String(program?.language ?? "").trim(),
    tuition: String(program?.tuition ?? "").trim(),
    link: String(program?.link ?? "").trim(),
  }));
}

function normalizeOfferings(offerings) {
  if (!Array.isArray(offerings)) return [];
  return offerings.map((offering) => ({
    studyAreaId: normalizeObjectId(offering?.studyAreaId),
    disciplineId: normalizeObjectId(offering?.disciplineId),
    categoryId: normalizeObjectId(offering?.categoryId),
    year: String(offering?.year ?? "").trim(),
    languageIds: normalizeObjectIdArray(offering?.languageIds),
    feePerYear: String(offering?.feePerYear ?? "").trim(),
    website: String(offering?.website ?? "").trim(),
  }));
}

function syncProgramDurationsFromYear(programs, year) {
  const duration = String(year ?? "").trim();
  if (!duration || !Array.isArray(programs)) return programs;
  return programs.map((program) => {
    const row = program?.toObject ? program.toObject() : { ...program };
    return { ...row, duration };
  });
}

async function resolveLanguageLabel(languageIds = []) {
  if (!Array.isArray(languageIds) || !languageIds.length) return "";
  const ids = languageIds.map((id) => String(id)).filter((id) => isValidObjectId(id));
  if (!ids.length) return "";
  const rows = await UniversityLanguage.find({ _id: { $in: ids }, del_status: "Live" }).select("name");
  return rows.map((row) => row.name).filter(Boolean).join(" / ");
}

async function resolveDefaultProgramLevel() {
  const category = await UniversityCategory.findOne({ del_status: "Live", isVisible: true })
    .sort({ name: 1 })
    .select("name");
  return category?.name?.trim() || "Bachelor";
}

async function syncUniversityLocationFields(university) {
  if (!university.locationId || !isValidObjectId(String(university.locationId))) return;
  const location = await UniversityLocation.findOne({
    _id: university.locationId,
    del_status: "Live",
  }).populate("countryId", "name flag code");
  if (!location) return;
  university.city = String(location.name ?? "").trim();
  const country =
    location.countryId && typeof location.countryId === "object" ? location.countryId : null;
  const countryName = country ? String(country.name ?? "").trim() : "";
  if (countryName) university.country = countryName;
  const countryFlag = country ? String(country.flag ?? "").trim() : "";
  const countryCode = country ? String(country.code ?? "").trim() : "";
  if (countryFlag) {
    university.flag = countryFlag;
  } else if (countryCode) {
    university.flag = buildFlagIconUrl(countryCode);
  }
}

async function resolveUniversityProgramLevel(university) {
  if (university.categoryId && isValidObjectId(String(university.categoryId))) {
    const category = await UniversityCategory.findOne({
      _id: university.categoryId,
      del_status: "Live",
    }).select("name");
    if (category?.name) return String(category.name).trim();
  }
  return resolveDefaultProgramLevel();
}

async function buildProgramsFromOfferings(university) {
  const offerings = university.offerings;
  if (!Array.isArray(offerings) || offerings.length === 0) return null;

  const studyAreaIds = [...new Set(offerings.map((row) => row.studyAreaId).filter(Boolean))];
  const disciplineIds = [...new Set(offerings.map((row) => row.disciplineId).filter(Boolean))];
  const categoryIds = [...new Set(offerings.map((row) => row.categoryId).filter(Boolean))];
  const languageIds = [
    ...new Set(offerings.flatMap((row) => (Array.isArray(row.languageIds) ? row.languageIds : []))),
  ];

  const [studyAreas, disciplines, categories, languages] = await Promise.all([
    studyAreaIds.length
      ? UniversityProgram.find({ _id: { $in: studyAreaIds }, del_status: "Live" }).select("name")
      : [],
    disciplineIds.length
      ? UniversityDiscipline.find({ _id: { $in: disciplineIds }, del_status: "Live" }).select("name")
      : [],
    categoryIds.length
      ? UniversityCategory.find({ _id: { $in: categoryIds }, del_status: "Live" }).select("name")
      : [],
    languageIds.length
      ? UniversityLanguage.find({ _id: { $in: languageIds }, del_status: "Live" }).select("name")
      : [],
  ]);

  const studyAreaMap = new Map(studyAreas.map((row) => [String(row._id), row.name]));
  const disciplineMap = new Map(disciplines.map((row) => [String(row._id), row.name]));
  const categoryMap = new Map(categories.map((row) => [String(row._id), row.name]));
  const languageMap = new Map(languages.map((row) => [String(row._id), row.name]));
  const defaultLink = String(university.website ?? "").trim();

  return offerings.map((offering) => {
    const course = studyAreaMap.get(String(offering.studyAreaId)) || "General";
    const field = disciplineMap.get(String(offering.disciplineId)) || "General";
    const level = categoryMap.get(String(offering.categoryId)) || "";
    const duration = String(offering.year ?? "").trim();
    const language = (offering.languageIds || [])
      .map((id) => languageMap.get(String(id)))
      .filter(Boolean)
      .join(" / ");
    const tuition = String(offering.feePerYear ?? "").trim();
    const link = String(offering.website ?? "").trim() || defaultLink;

    return { course, field, level, duration, language, tuition, link };
  });
}

function mirrorLegacyFieldsFromFirstOffering(university) {
  const first = Array.isArray(university.offerings) ? university.offerings[0] : null;
  if (!first) return;
  if (first.categoryId) university.categoryId = first.categoryId;
  if (first.year) university.year = first.year;
  if (Array.isArray(first.languageIds) && first.languageIds.length) {
    university.languageIds = first.languageIds;
  }
  if (first.feePerYear) university.feePerYear = first.feePerYear;
  if (first.website) university.website = first.website;
}

async function syncUniversityProgramsFromAdmin(university) {
  if (Array.isArray(university.offerings)) {
    if (university.offerings.length === 0) {
      university.programs = [];
      return;
    }

    const fromOfferings = await buildProgramsFromOfferings(university);
    if (fromOfferings && fromOfferings.length > 0) {
      university.programs = fromOfferings;
      mirrorLegacyFieldsFromFirstOffering(university);
      return;
    }
  }

  const duration = String(university.year ?? "").trim();
  const tuition = String(university.feePerYear ?? "").trim();
  const language = await resolveLanguageLabel(university.languageIds);
  const link = String(university.website ?? "").trim();
  const level = await resolveUniversityProgramLevel(university);

  if (!Array.isArray(university.programs) || university.programs.length === 0) {
    university.programs = [
      {
        course: String(university.name ?? "General").trim() || "General",
        field: "General",
        level,
        duration,
        language,
        tuition,
        link,
      },
    ];
    return;
  }

  university.programs.forEach((program) => {
    if (level) program.level = level;
    if (duration) program.duration = duration;
    if (tuition) program.tuition = tuition;
    if (language) program.language = language;
    if (link && !program.link) program.link = link;
  });
}

async function applyUniversityAdminSync(university) {
  await syncUniversityLocationFields(university);
  await syncUniversityProgramsFromAdmin(university);
}

function buildUniversityPayload(body = {}) {
  const payload = {};

  if (body.isPublished === "true" || body.isPublished === "1") body.isPublished = true;
  if (body.isPublished === "false" || body.isPublished === "0") body.isPublished = false;
  if (body.isVisible === "true" || body.isVisible === "1") body.isVisible = true;
  if (body.isVisible === "false" || body.isVisible === "0") body.isVisible = false;

  if (body.name != null) payload.name = String(body.name).trim();
  if (body.slug != null) payload.slug = String(body.slug).trim();
  if (body.country != null) payload.country = String(body.country).trim();
  if (body.region != null) payload.region = String(body.region).trim();
  if (body.city != null) payload.city = String(body.city).trim();
  if (body.flag != null) payload.flag = String(body.flag).trim();
  if (body.ranking != null) payload.ranking = String(body.ranking).trim();
  if (body.programs !== undefined) payload.programs = normalizePrograms(body.programs);
  if (body.offerings !== undefined) payload.offerings = normalizeOfferings(body.offerings);
  if (body.locationId !== undefined) payload.locationId = normalizeObjectId(body.locationId);
  if (body.categoryId !== undefined) payload.categoryId = normalizeObjectId(body.categoryId);
  if (body.year != null) payload.year = String(body.year).trim();
  if (body.languageIds !== undefined) payload.languageIds = normalizeObjectIdArray(body.languageIds);
  if (body.feePerYear != null) payload.feePerYear = String(body.feePerYear).trim();
  if (body.website != null) payload.website = String(body.website).trim();
  if (body.isPublished !== undefined) payload.isPublished = Boolean(body.isPublished);
  if (body.isVisible !== undefined) payload.isVisible = Boolean(body.isVisible);
  if (body.sortOrder != null && Number.isFinite(Number(body.sortOrder))) {
    payload.sortOrder = Math.max(0, Math.trunc(Number(body.sortOrder)));
  }

  return payload;
}

const UNIVERSITY_POPULATE = [
  { path: "locationId", select: "name countryId", populate: { path: "countryId", select: "name flag code" } },
  { path: "categoryId", select: "name" },
  { path: "languageIds", select: "name countryId", populate: { path: "countryId", select: "name flag code" } },
  { path: "offerings.studyAreaId", select: "name disciplineId" },
  { path: "offerings.disciplineId", select: "name" },
  { path: "offerings.categoryId", select: "name" },
  { path: "offerings.languageIds", select: "name" },
];

module.exports = {
  buildUniversityPayload,
  normalizePrograms,
  normalizeOfferings,
  syncProgramDurationsFromYear,
  applyUniversityAdminSync,
  UNIVERSITY_POPULATE,
  normalizeObjectId,
  normalizeObjectIdArray,
};
