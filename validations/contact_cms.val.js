const Joi = require("joi");

const contactInfoFields = {
  icon: Joi.string().allow("").optional(),
  title: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  isVisible: Joi.boolean().optional(),
};

const sectionSchema = Joi.object({
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
  emailSection: Joi.object(contactInfoFields).unknown(true).optional(),
  phoneSection: Joi.object(contactInfoFields).unknown(true).optional(),
  locationSection: Joi.object(contactInfoFields).unknown(true).optional(),
  isVisible: Joi.boolean().optional(),
}).unknown(true);

const createSchema = sectionSchema;
const updateSchema = sectionSchema;

module.exports = { createSchema, updateSchema };
