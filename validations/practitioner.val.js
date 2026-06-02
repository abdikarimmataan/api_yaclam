const Joi = require("joi");

const createSchema = Joi.object({
  initials: Joi.string().allow("").optional(),
  name: Joi.string().required(),
  role: Joi.string().allow("").optional(),
  coursesCount: Joi.number().optional(),
  studentsCount: Joi.string().allow("").optional(),
  color: Joi.string().allow("").optional(),
  sortOrder: Joi.number().optional(),
  isVisible: Joi.boolean().optional(),
});

const updateSchema = createSchema.fork(["name"], (s) => s.optional());

module.exports = { createSchema, updateSchema };
