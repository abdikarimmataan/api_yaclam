const Joi = require("joi");

const createSchema = Joi.object({
  heroBadgeText: Joi.string().allow("").optional(),
  heroTitle: Joi.string().allow("").optional(),
  heroSubtitle: Joi.string().allow("").optional(),
  heroBrandMark: Joi.string().allow("").optional(),
  heroVerseArabic: Joi.string().allow("").optional(),
  heroVerseTranslation: Joi.string().allow("").optional(),
  heroLearnerCountText: Joi.string().allow("").optional(),
  heroShowLearnerAvatars: Joi.boolean().optional(),
  heroIsVisible: Joi.boolean().optional(),
  stats: Joi.array().optional(),
  statsIsVisible: Joi.boolean().optional(),
  isVisible: Joi.boolean().optional(),
}).unknown(true);

const updateSchema = createSchema;

module.exports = { createSchema, updateSchema };
