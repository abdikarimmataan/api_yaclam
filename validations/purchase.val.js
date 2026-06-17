const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const createSchema = Joi.object({
  studentID: objectId.required(),
  courseId: objectId.required(),
  transactionID: Joi.string().allow(null, "").optional(),
});

const enrollFreeSchema = Joi.object({
  courseId: objectId.required(),
});

module.exports = { createSchema, enrollFreeSchema };
