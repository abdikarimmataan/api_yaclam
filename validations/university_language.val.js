const Joi = require("joi");
const { isValidObjectId } = require("mongoose");

const objectId = Joi.string().custom((value, helpers) => {
  if (!value || !String(value).trim()) return value;
  if (!isValidObjectId(value)) return helpers.error("any.invalid");
  return value;
}, "ObjectId validation");

const baseFields = {
  name: Joi.string().trim().min(1),
  countryId: objectId.allow(null, "").optional(),
  isVisible: Joi.boolean().optional(),
};

const createSchema = Joi.object({
  ...baseFields,
  name: baseFields.name.required(),
  countryId: objectId.required(),
});

const updateSchema = Joi.object(baseFields).min(1);

const updateStatusSchema = Joi.object({
  isVisible: Joi.boolean().required(),
});

module.exports = { createSchema, updateSchema, updateStatusSchema };
