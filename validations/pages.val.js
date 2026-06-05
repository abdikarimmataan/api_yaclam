const Joi = require("joi");

const sectionSchema = Joi.object({
  type: Joi.string().required(),
  data: Joi.object().unknown(true).required(),
});

const updateSchema = Joi.object({
  path: Joi.string().optional(),
  title: Joi.string().allow("").optional(),
  status: Joi.string().valid("draft", "published").optional(),
  sections: Joi.array().items(sectionSchema).optional(),
});

module.exports = { updateSchema };
