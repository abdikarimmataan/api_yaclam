const Joi = require("joi");
const { isValidObjectId } = require("mongoose");

const objectId = Joi.string().custom((value, helpers) => {
  if (!value || !String(value).trim()) return value;
  if (!isValidObjectId(value)) return helpers.error("any.invalid");
  return value;
}, "ObjectId validation");

const offeringSchema = Joi.object({
  studyAreaId: objectId.allow(null, "").optional(),
  disciplineId: objectId.allow(null, "").optional(),
  categoryId: objectId.allow(null, "").optional(),
  year: Joi.string().allow("", null).optional(),
  languageIds: Joi.array().items(objectId).optional(),
  feePerYear: Joi.string().allow("").optional(),
  website: Joi.string().allow("").optional(),
});

const createSchema = Joi.object({
  universityId: objectId.required(),
  offerings: Joi.array().items(offeringSchema).min(1).required(),
});

const updateSchema = Joi.object({
  universityId: objectId.optional(),
  offerings: Joi.array().items(offeringSchema).min(1).optional(),
}).min(1);

module.exports = { createSchema, updateSchema };
