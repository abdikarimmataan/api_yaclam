const Joi = require("joi");
const { FUNDING_TYPES, parseDeadlineDate } = require("../utilities/scholarship.utility");

const stringList = Joi.alternatives().try(
  Joi.array().items(Joi.string()),
  Joi.string().allow("")
);

const ctaButtonSchema = Joi.object({
  label: Joi.string().allow("").optional(),
  url: Joi.string().allow("").optional(),
  isVisible: Joi.boolean().optional(),
});

const baseFields = {
  name: Joi.string().trim().min(1),
  title: Joi.string().trim().min(1),
  provider: Joi.string().allow("").optional(),
  country: Joi.string().allow("").optional(),
  level: Joi.string().allow("").optional(),
  funding: Joi.string()
    .valid(...FUNDING_TYPES)
    .optional(),
  flag: Joi.string().allow("").optional(),
  deadline: Joi.alternatives()
    .try(Joi.date(), Joi.string().trim().allow(""))
    .optional()
    .custom((value, helpers) => {
      if (value === undefined || value === null || value === "") return value;
      const parsed = parseDeadlineDate(value);
      if (parsed === null) return helpers.error("any.invalid");
      return parsed;
    })
    .messages({
      "any.invalid": "deadline must be a valid date (e.g. 2026-12-30 or Dec 30, 2026)",
    }),
  amount: Joi.string().allow("").optional(),
  website: Joi.string().allow("").optional(),
  applicationUrl: Joi.string().allow("").optional(),
  overview: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  benefits: stringList.optional(),
  eligibility: stringList.optional(),
  documents: stringList.optional(),
  documentsRequired: stringList.optional(),
  ctaButton: ctaButtonSchema.optional(),
  isFeatured: Joi.boolean().optional(),
  isPublished: Joi.boolean().optional(),
  isVisible: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  status: Joi.boolean().optional(),
};

const createSchema = Joi.object({
  ...baseFields,
  name: baseFields.name.required(),
});

const updateSchema = Joi.object(baseFields).min(1);

const updateStatusSchema = Joi.object({
  status: Joi.boolean().required(),
});

module.exports = { createSchema, updateSchema, updateStatusSchema };
