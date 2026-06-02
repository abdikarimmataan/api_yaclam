const Joi = require("joi");

const createSchema = Joi.object({
  icon: Joi.string().allow("").optional(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  sortOrder: Joi.number().optional(),
  isVisible: Joi.boolean().optional(),
});

const updateSchema = createSchema.fork(["title", "description"], (s) => s.optional());

module.exports = { createSchema, updateSchema };
