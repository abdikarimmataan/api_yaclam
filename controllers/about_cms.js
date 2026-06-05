const AboutCms = require("../models/about_cms.model");
const { buildPageCmsController } = require("../utilities/page_cms.utility");

module.exports = buildPageCmsController(AboutCms);
