const Joi = require("joi");

const createSchema = Joi.object({
  title: Joi.string().required(),
  slug: Joi.string().required(),
  fieldId: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  shortDescription: Joi.string().allow("").optional(),
  category: Joi.string().allow("").optional(),
  instructorName: Joi.string().allow("").optional(),
  thumbnail: Joi.string().allow("").optional(),
  price: Joi.number().min(0).optional(),
  originalPrice: Joi.number().min(0).optional(),
  isFree: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  isPublished: Joi.boolean().optional(),
  isVisible: Joi.boolean().optional(),
  durationHours: Joi.number().optional(),
  lessonCount: Joi.number().optional(),
  rating: Joi.number().optional(),
  reviewCount: Joi.number().optional(),
  studentCount: Joi.number().optional(),
  sortOrder: Joi.number().optional(),
  status: Joi.boolean().optional(),
});

const updateSchema = createSchema.fork(["title", "slug"], (s) => s.optional());

module.exports = { createSchema, updateSchema };
