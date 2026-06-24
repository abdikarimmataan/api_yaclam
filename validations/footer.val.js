const Joi = require("joi");

const linkSchema = Joi.object({
  label: Joi.string().allow("").optional(),
  url: Joi.string().allow("").optional(),
  isVisible: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  siteName: Joi.string().allow("").optional(),
  siteNameArabic: Joi.string().allow("").optional(),
  logo: Joi.object({
    isVisible: Joi.boolean().optional(),
    text: Joi.object({
      mark: Joi.string().allow("").optional(),
      name: Joi.string().allow("").optional(),
      highlight: Joi.string().allow("").optional(),
      isVisible: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
  socials: Joi.object({
    facebook: Joi.string().allow("").optional(),
    twitter: Joi.string().allow("").optional(),
    linkedin: Joi.string().allow("").optional(),
    youtube: Joi.string().allow("").optional(),
    instagram: Joi.string().allow("").optional(),
    whatsapp: Joi.string().allow("").optional(),
  }).optional(),
  footer: Joi.object({
    description: Joi.string().allow("").optional(),
    copyright: Joi.string().allow("").optional(),
    tagline: Joi.string().allow("").optional(),
    columns: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().allow("").optional(),
          links: Joi.array().items(linkSchema).optional(),
          isVisible: Joi.boolean().optional(),
        })
      )
      .optional(),
  }).optional(),
  isVisible: Joi.boolean().optional(),
}).unknown(false);

const createSchema = updateSchema;

module.exports = { createSchema, updateSchema };
