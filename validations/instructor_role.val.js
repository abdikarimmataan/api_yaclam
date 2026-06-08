const Joi = require("joi");

const baseFields = {
  name: Joi.string().trim().min(1),
  description: Joi.string().allow("").optional(),
};

const createSchema = Joi.object({
  ...baseFields,
  name: baseFields.name.required(),
});

const updateSchema = Joi.object(baseFields).min(1);

module.exports = { createSchema, updateSchema };
