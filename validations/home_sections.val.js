const Joi = require("joi");

const sectionTextFields = {
  eyebrow: Joi.string().allow("").optional(),
  title: Joi.string().allow("").optional(),
  subtitle: Joi.string().allow("").optional(),
  cardNumberVisible: Joi.number().integer().min(0).optional(),
  isVisible: Joi.boolean().optional(),
};

const featuredCoursesSectionFields = {
  ...sectionTextFields,
  gridRows: Joi.number().integer().min(1).max(6).optional(),
  gridColumns: Joi.number().integer().min(1).max(6).optional(),
};

const createSchema = Joi.object({
  fieldSection: Joi.object({ ...sectionTextFields }).unknown(true).optional(),
  featuredCoursesSection: Joi.object({ ...featuredCoursesSectionFields }).unknown(true).optional(),
  whyYaclamSection: Joi.object({ ...sectionTextFields }).unknown(true).optional(),
  roadmapsSection: Joi.object({ ...sectionTextFields }).unknown(true).optional(),
  scholarshipsSection: Joi.object({ ...sectionTextFields }).unknown(true).optional(),
  practitionersSection: Joi.object({ ...sectionTextFields }).unknown(true).optional(),
  testimonialsSection: Joi.object({ ...sectionTextFields }).unknown(true).optional(),
  ctaSection: Joi.object({}).unknown(true).optional(),
  isVisible: Joi.boolean().optional(),
}).unknown(true);

const updateSchema = createSchema;

module.exports = { createSchema, updateSchema };
