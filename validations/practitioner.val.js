const Joi = require("joi");

const baseFields = {
  initials: Joi.string().allow("").optional(),
  name: Joi.string().trim().min(1),
  role: Joi.string().allow("").optional(),
  bio: Joi.string().allow("").optional(),
  coursesCount: Joi.number().min(0).optional(),
  courses: Joi.number().min(0).optional(),
  studentsCount: Joi.string().allow("").optional(),
  students: Joi.string().allow("").optional(),
  color: Joi.string().allow("").optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
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
