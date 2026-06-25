const Joi = require("joi");

const baseFields = {
  name: Joi.string().trim().min(1),
  description: Joi.string().allow("").optional(),
  sortOrder: Joi.number().optional(),
  isVisible: Joi.boolean().optional(),
};

const createSchema = Joi.object({
  ...baseFields,
  name: baseFields.name.required(),
});

const updateSchema = Joi.object(baseFields).min(1);

const updateStatusSchema = Joi.object({
  isVisible: Joi.boolean().required(),
});

module.exports = { createSchema, updateSchema, updateStatusSchema };
