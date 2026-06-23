const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const paySchema = Joi.object({
  phone: Joi.string().trim().min(8).max(20).required(),
  courseId: objectId.required(),
});

const stripeCheckoutSchema = Joi.object({
  courseId: objectId.required(),
  cancelUrl: Joi.string().uri().optional(),
});

const stripeIntentSchema = Joi.object({
  courseId: objectId.required(),
});

const stripeConfirmSchema = Joi.object({
  sessionId: Joi.string().trim().min(8),
  paymentIntentId: Joi.string().trim().min(8),
}).or("sessionId", "paymentIntentId");

module.exports = { paySchema, stripeCheckoutSchema, stripeIntentSchema, stripeConfirmSchema };
