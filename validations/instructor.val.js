const Joi = require("joi");
const message = require("../utilities/message.utility");

const passwordRule = Joi.string()
  .min(6)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[!-~]{6,}$/)
  .message(message.PASSWORD_VALIDITY);

const baseFields = {
  name: Joi.string().trim().min(1),
  email: Joi.string().email(),
  phone: Joi.string().allow("").optional(),
  photo: Joi.string().allow("").optional(),
  bio: Joi.string().allow("").optional(),
  instructorRoleId: Joi.string().allow(null, "").optional(),
  password: passwordRule,
  status: Joi.string().valid("active", "inactive").optional(),
};

const createSchema = Joi.object({
  ...baseFields,
  name: baseFields.name.required(),
  email: baseFields.email.required(),
  password: baseFields.password.required(),
});

const updateSchema = Joi.object({
  ...baseFields,
  password: passwordRule.optional(),
}).min(1);

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { createSchema, updateSchema, loginSchema };
