const University = require("../models/university.model");
const UniversityManage = require("../models/university_manage.model");
const UniversityProgram = require("../models/university_program.model");
const UniversityDiscipline = require("../models/university_discipline.model");
const UniversityCategory = require("../models/university_category.model");
const UniversityLocation = require("../models/university_location.model");
const UniversityLanguage = require("../models/university_language.model");
const Response = require("../utilities/reponse.utility.js");

async function latestTimestamp(Model) {
  const row = await Model.findOne({ del_status: "Live" })
    .sort({ updated_at: -1 })
    .select("updated_at")
    .lean();
  if (!row?.updated_at) return 0;
  const time = new Date(row.updated_at).getTime();
  return Number.isFinite(time) ? time : 0;
}

async function liveCount(Model) {
  return Model.countDocuments({ del_status: "Live" });
}

module.exports = {
  getVersion: async (_req, res) => {
    try {
      const [
        manageAt,
        universityAt,
        programAt,
        disciplineAt,
        categoryAt,
        locationAt,
        languageAt,
        manageCount,
        universityCount,
      ] = await Promise.all([
        latestTimestamp(UniversityManage),
        latestTimestamp(University),
        latestTimestamp(UniversityProgram),
        latestTimestamp(UniversityDiscipline),
        latestTimestamp(UniversityCategory),
        latestTimestamp(UniversityLocation),
        latestTimestamp(UniversityLanguage),
        liveCount(UniversityManage),
        liveCount(University),
      ]);

      const version = [
        manageAt,
        universityAt,
        programAt,
        disciplineAt,
        categoryAt,
        locationAt,
        languageAt,
        manageCount,
        universityCount,
      ].join(":");

      return Response.successResponse(res, 200, { version });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
