const Joi = require("joi");
const message = require("../utilities/message.utility");

const passwordRule = Joi.string()
  .min(6)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[!-~]{6,}$/)
  .message(message.PASSWORD_VALIDITY);

const profileSchema = Joi.object({
  full_name: Joi.string().required(),
  avatar_url: Joi.string().allow("").optional(),
  bio: Joi.string().allow("").optional(),
});

module.exports = {
  registerSchema: Joi.object({
    fullname: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    password: passwordRule.required(),
    status: Joi.boolean().default(true),
  }),

  forgotPasswordSchema: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPasswordSchema: Joi.object({
    token: Joi.string().required(),
    newPassword: passwordRule.required(),
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
      "any.only": "Passwords do not match",
    }),
  }),

  loginSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  bootstrapAdminSchema: Joi.object({
    email: Joi.string().email().required(),
    password: passwordRule.required(),
    phone: Joi.string().allow("").optional(),
    profile: profileSchema.required(),
  }),

  createAdminSchema: Joi.object({
    email: Joi.string().email().required(),
    password: passwordRule.required(),
    phone: Joi.string().allow("").optional(),
    roleId: Joi.string().allow(null, "").optional(),
    profile: profileSchema.required(),
  }),

  updateAdminSchema: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().allow("").optional(),
    roleId: Joi.string().allow(null, "").optional(),
    profile: profileSchema.optional(),
    status: Joi.boolean().optional(),
    approve: Joi.boolean().optional(),
  }),

  passwordChangeSchema: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: passwordRule.required(),
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
      "any.only": "Passwords do not match",
    }),
  }),
};
