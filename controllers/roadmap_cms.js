const RoadmapCms = require("../models/roadmap_cms.model");
const { buildPageCmsController } = require("../utilities/page_cms.utility");

module.exports = buildPageCmsController(RoadmapCms);
