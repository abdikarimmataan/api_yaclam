const Joi = require("joi");

const createSchema = Joi.object({
  courseId: Joi.string().required(),
  lessonId: Joi.string().allow("").optional(),
  text: Joi.string().trim().min(1).max(2000).required(),
});

const replySchema = Joi.object({
  text: Joi.string().trim().min(1).max(2000).required(),
});

const courseIdParamSchema = Joi.object({
  courseId: Joi.string().required(),
});

const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

module.exports = {
  createSchema,
  replySchema,
  courseIdParamSchema,
  idParamSchema,
};
