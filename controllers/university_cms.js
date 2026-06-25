const UniversityCms = require("../models/university_cms.model");
const { buildPageCmsController } = require("../utilities/page_cms.utility");

module.exports = buildPageCmsController(UniversityCms);
