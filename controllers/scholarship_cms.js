const ScholarshipCms = require("../models/scholarship_cms.model");
const { buildPageCmsController } = require("../utilities/page_cms.utility");

module.exports = buildPageCmsController(ScholarshipCms);
