const CourseCms = require("../models/course_cms.model");
const { buildPageCmsController } = require("../utilities/page_cms.utility");

module.exports = buildPageCmsController(CourseCms);
