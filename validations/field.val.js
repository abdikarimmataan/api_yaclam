const Joi = require("joi");

const createSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  icon: Joi.string().allow("").optional(),
  sortOrder: Joi.number().optional(),
  isVisible: Joi.boolean().optional(),
  status: Joi.boolean().optional(),
});

const updateSchema = createSchema.fork(["name", "slug"], (s) => s.optional());

module.exports = { createSchema, updateSchema };
