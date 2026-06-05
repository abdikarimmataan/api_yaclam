const Joi = require("joi");

const baseFields = {
  text: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  quote: Joi.string().allow("").optional(),
  profileImage: Joi.string().allow("").optional(),
  initials: Joi.string().allow("").optional(),
  name: Joi.string().trim().min(1),
  role: Joi.string().allow("").optional(),
  location: Joi.string().allow("").optional(),
  sortOrder: Joi.number().optional(),
  isVisible: Joi.boolean().optional(),
};

const createSchema = Joi.object({
  ...baseFields,
  name: baseFields.name.required(),
})
  .or("text", "description", "quote")
  .messages({
    "object.missing": "Quote text is required (use text, description, or quote)",
  });

const updateSchema = Joi.object(baseFields).min(1);

const updateStatusSchema = Joi.object({
  isVisible: Joi.boolean().required(),
});

module.exports = { createSchema, updateSchema, updateStatusSchema };
