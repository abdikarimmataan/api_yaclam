const Joi = require("joi");
const { parseDeadlineDate: parsePublishedDate } = require("../utilities/scholarship.utility");

const bodyField = Joi.alternatives().try(
  Joi.array().items(Joi.string()),
  Joi.string().allow("")
);

const baseFields = {
  title: Joi.string().trim().min(1),
  excerpt: Joi.string().allow("").optional(),
  body: bodyField.optional(),
  content: Joi.string().allow("").optional(),
  categoryId: Joi.string().optional(),
  readTime: Joi.number().min(0).optional(),
  publishedDate: Joi.alternatives()
    .try(Joi.date(), Joi.string().trim().allow(""))
    .optional()
    .custom((value, helpers) => {
      if (value === undefined || value === null || value === "") return value;
      const parsed = parsePublishedDate(value);
      if (parsed === null) return helpers.error("any.invalid");
      return parsed;
    })
    .messages({
      "any.invalid": "publishedDate must be a valid date (e.g. 2026-02-25 or Feb 25, 2026)",
    }),
  date: Joi.alternatives()
    .try(Joi.date(), Joi.string().trim().allow(""))
    .optional()
    .custom((value, helpers) => {
      if (value === undefined || value === null || value === "") return value;
      const parsed = parsePublishedDate(value);
      if (parsed === null) return helpers.error("any.invalid");
      return parsed;
    })
    .messages({
      "any.invalid": "date must be a valid date (e.g. 2026-02-25 or Feb 25, 2026)",
    }),
  coverImage: Joi.string().allow("").optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  color: Joi.string().allow("").optional(),
  status: Joi.string().valid("draft", "published").optional(),
  isVisible: Joi.boolean().optional(),
  ctaButton: Joi.object({
    label: Joi.string().allow("").optional(),
    url: Joi.string().allow("").optional(),
    isVisible: Joi.boolean().optional(),
  }).optional(),
};

const createSchema = Joi.object({
  ...baseFields,
  title: baseFields.title.required(),
  categoryId: Joi.string().required(),
});

const updateSchema = Joi.object(baseFields).min(1);

const updateStatusSchema = Joi.object({
  status: Joi.string().valid("draft", "published").required(),
});

module.exports = { createSchema, updateSchema, updateStatusSchema };
