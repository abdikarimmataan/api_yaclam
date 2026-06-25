const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const University = require("../models/university.model");
const {
  normalizeOfferings,
  applyUniversityAdminSync,
  normalizeObjectId,
} = require("./university.utility");

function buildManagePayload(body = {}) {
  const payload = {};
  if (body.universityId !== undefined) {
    payload.universityId = normalizeObjectId(body.universityId);
  }
  if (body.offerings !== undefined) {
    payload.offerings = normalizeOfferings(body.offerings);
  }
  return payload;
}

async function syncManageOfferingsToUniversity(universityId, offerings = []) {
  if (!universityId || !isValidObjectId(String(universityId))) return;
  const university = await University.findOne({ _id: universityId, del_status: "Live" });
  if (!university) return;

  university.offerings = normalizeOfferings(offerings);
  await applyUniversityAdminSync(university);
  await university.save();
}

async function clearUniversityManageData(universityId) {
  if (!universityId || !isValidObjectId(String(universityId))) return;
  const university = await University.findOne({ _id: universityId, del_status: "Live" });
  if (!university) return;

  university.offerings = [];
  university.programs = [];
  university.categoryId = null;
  university.year = "";
  university.languageIds = [];
  university.feePerYear = "";
  university.website = "";
  await university.save();
}

const MANAGE_POPULATE = [
  {
    path: "universityId",
    select: "name locationId country city programs offerings",
    populate: {
      path: "locationId",
      select: "name countryId",
      populate: { path: "countryId", select: "name flag code" },
    },
  },
  { path: "offerings.studyAreaId", select: "name" },
  { path: "offerings.disciplineId", select: "name" },
  { path: "offerings.categoryId", select: "name" },
  { path: "offerings.languageIds", select: "name" },
];

module.exports = {
  buildManagePayload,
  syncManageOfferingsToUniversity,
  clearUniversityManageData,
  MANAGE_POPULATE,
};
