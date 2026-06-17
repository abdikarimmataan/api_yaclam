const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const addItemSchema = Joi.object({
  courseId: objectId.required(),
});

module.exports = { addItemSchema };
