const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const HomeSections = require("../models/home_sections.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");

const SECTION_KEYS = [
  "fieldSection",
  "featuredCoursesSection",
  "whyYaclamSection",
  "roadmapsSection",
  "scholarshipsSection",
  "practitionersSection",
  "testimonialsSection",
  "ctaSection",
];

const CARD_SECTION_KEYS = [
  "fieldSection",
  "featuredCoursesSection",
  "whyYaclamSection",
  "roadmapsSection",
  "scholarshipsSection",
  "practitionersSection",
  "testimonialsSection",
];

function applySectionVisibility(payload = {}) {
  const data = { ...payload };
  SECTION_KEYS.forEach((key) => {
    if (data[key] && typeof data[key] === "object" && data[key].isVisible === undefined) {
      data[key] = { ...data[key], isVisible: true };
    }
  });

  CARD_SECTION_KEYS.forEach((key) => {
    if (data[key] && typeof data[key] === "object" && data[key].cardNumberVisible === undefined) {
      data[key] = { ...data[key], cardNumberVisible: 5 };
    }
  });

  if (data.ctaSection && typeof data.ctaSection === "object") {
    const cta = { ...data.ctaSection };
    if (cta.primaryButton && cta.primaryButton.isVisible === undefined) {
      cta.primaryButton = { ...cta.primaryButton, isVisible: true };
    }
    if (cta.secondaryButton && cta.secondaryButton.isVisible === undefined) {
      cta.secondaryButton = { ...cta.secondaryButton, isVisible: true };
    }
    data.ctaSection = cta;
  }

  if (data.featuredCoursesSection && typeof data.featuredCoursesSection === "object") {
    const featured = { ...data.featuredCoursesSection };
    if (featured.gridRows === undefined) featured.gridRows = 2;
    if (featured.gridColumns === undefined) featured.gridColumns = 3;
    if (featured.viewAllButton?.isVisible === undefined) {
      featured.viewAllButton = { ...featured.viewAllButton, isVisible: true };
    }
    data.featuredCoursesSection = featured;
  }
  if (data.roadmapsSection?.allRoadmapsButton?.isVisible === undefined) {
    data.roadmapsSection = {
      ...data.roadmapsSection,
      allRoadmapsButton: { ...data.roadmapsSection.allRoadmapsButton, isVisible: true },
    };
  }
  if (data.scholarshipsSection?.browseAllButton?.isVisible === undefined) {
    data.scholarshipsSection = {
      ...data.scholarshipsSection,
      browseAllButton: { ...data.scholarshipsSection.browseAllButton, isVisible: true },
    };
  }

  return data;
}

module.exports = {
  create: async (req, res) => {
    try {
      const doc = new HomeSections(applySectionVisibility(req.body));
      const saved = await doc.save();
      return Response.successResponse(res, 201, saved);
    } catch (err) {
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const data = await HomeSections.find({ del_status: "Live" }).sort({
        created_at: -1,
      });
      if (!data.length) return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      return Response.successResponse(res, 200, data);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      const doc = await HomeSections.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, doc);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      const doc = await HomeSections.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      Object.assign(doc, applySectionVisibility(req.body));
      const updated = await doc.save();
      return Response.successResponse(res, 200, updated);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      const doc = await HomeSections.findOne({ _id: id, del_status: "Live" });
      if (!doc) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      doc.del_status = "Deleted";
      await doc.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
