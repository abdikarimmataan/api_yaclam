const ContactCms = require("../models/contact_cms.model");
const { buildPageCmsController } = require("../utilities/page_cms.utility");

module.exports = buildPageCmsController(ContactCms);
