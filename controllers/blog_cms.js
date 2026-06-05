const BlogCms = require("../models/blog_cms.model");
const { buildPageCmsController } = require("../utilities/page_cms.utility");

module.exports = buildPageCmsController(BlogCms);
