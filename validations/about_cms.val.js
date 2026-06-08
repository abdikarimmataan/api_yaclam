const Joi = require("joi");

const buttonFields = {
  name: Joi.string().allow("").optional(),
  url: Joi.string().allow("").optional(),
  isVisible: Joi.boolean().optional(),
};

const iconCardFields = {
  icon: Joi.string().allow("").optional(),
  title: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  isVisible: Joi.boolean().optional(),
};

const sectionSchema = Joi.object({
  /** Legacy flat hero fields still accepted from page CMS editors */
  title: Joi.string().allow("").optional(),
  subtitle: Joi.string().allow("").optional(),
  emptyStateText: Joi.string().allow("").optional(),
  pageSection: Joi.object({
    title: Joi.string().allow("").optional(),
    subtitle: Joi.string().allow("").optional(),
    isVisible: Joi.boolean().optional(),
  })
    .unknown(true)
    .optional(),
  ourStorySection: Joi.object({
    eyebrow: Joi.string().allow("").optional(),
    title: Joi.string().allow("").optional(),
    description: Joi.string().allow("").optional(),
    button: Joi.object(buttonFields).unknown(true).optional(),
    isVisible: Joi.boolean().optional(),
  })
    .unknown(true)
    .optional(),
  missionSection: Joi.object(iconCardFields).unknown(true).optional(),
  visionSection: Joi.object(iconCardFields).unknown(true).optional(),
  valuesSection: Joi.object(iconCardFields).unknown(true).optional(),
  ecosystemSection: Joi.object(iconCardFields).unknown(true).optional(),
  verseSection: Joi.object({
    verseArabic: Joi.string().allow("").optional(),
    verseTranslation: Joi.string().allow("").optional(),
    isVisible: Joi.boolean().optional(),
  })
    .unknown(true)
    .optional(),
  isVisible: Joi.boolean().optional(),
}).unknown(true);

const createSchema = sectionSchema;
const updateSchema = sectionSchema;

module.exports = { createSchema, updateSchema };
