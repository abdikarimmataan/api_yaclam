const Joi = require("joi");

const createSchema = Joi.object({
  courseId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  text: Joi.string().allow("").max(2000).optional(),
});

const courseIdParamSchema = Joi.object({
  courseId: Joi.string().required(),
});

const courseIdsQuerySchema = Joi.object({
  ids: Joi.string().allow("").optional(),
});

module.exports = { createSchema, courseIdParamSchema, courseIdsQuerySchema };
