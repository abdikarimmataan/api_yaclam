const Joi = require("joi");

const createSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  description: Joi.string().allow("").optional(),
  icon: Joi.string().allow("").optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isVisible: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().trim().min(1).optional(),
  description: Joi.string().allow("").optional(),
  icon: Joi.string().allow("").optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
});

const updateStatusSchema = Joi.object({
  isVisible: Joi.boolean().required(),
});

module.exports = { createSchema, updateSchema, updateStatusSchema };
