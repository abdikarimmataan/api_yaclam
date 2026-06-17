const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const paySchema = Joi.object({
  phone: Joi.string().trim().min(8).max(20).required(),
  courseId: objectId.required(),
});

module.exports = { paySchema };
