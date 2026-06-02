const Joi = require("joi");

const createSchema = Joi.object({
  description: Joi.string().required(),
  profileImage: Joi.string().allow("").optional(),
  initials: Joi.string().allow("").optional(),
  name: Joi.string().required(),
  role: Joi.string().allow("").optional(),
  location: Joi.string().allow("").optional(),
  sortOrder: Joi.number().optional(),
  isVisible: Joi.boolean().optional(),
});

const updateSchema = createSchema.fork(["description", "name"], (s) => s.optional());

module.exports = { createSchema, updateSchema };
