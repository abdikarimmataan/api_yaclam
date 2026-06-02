const Joi = require("joi");

const updateSchema = Joi.object({
  siteName: Joi.string().allow("").optional(),
  siteNameArabic: Joi.string().allow("").optional(),
  siteTagline: Joi.string().allow("").optional(),
  logo: Joi.object({
    isVisible: Joi.boolean().optional(),
    text: Joi.object({
      mark: Joi.string().allow("").optional(),
      name: Joi.string().allow("").optional(),
      highlight: Joi.string().allow("").optional(),
      isVisible: Joi.boolean().optional(),
    }).optional(),
    picture: Joi.object({
      light: Joi.string().allow("").optional(),
      dark: Joi.string().allow("").optional(),
      alt: Joi.string().allow("").optional(),
      isVisible: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
  favicon: Joi.string().allow("").optional(),
  contact: Joi.object({
    email: Joi.string().email().allow("").optional(),
    phone: Joi.string().allow("").optional(),
    location: Joi.string().allow("").optional(),
  }).optional(),
  socials: Joi.object({
    facebook: Joi.string().allow("").optional(),
    twitter: Joi.string().allow("").optional(),
    linkedin: Joi.string().allow("").optional(),
    youtube: Joi.string().allow("").optional(),
    instagram: Joi.string().allow("").optional(),
  }).optional(),
  seo: Joi.object({
    title: Joi.string().allow("").optional(),
    description: Joi.string().allow("").optional(),
    keywords: Joi.array().items(Joi.string()).optional(),
  }).optional(),
}).unknown(false);

module.exports = { updateSchema };
