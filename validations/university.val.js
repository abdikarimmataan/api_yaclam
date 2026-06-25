const Joi = require("joi");
const { isValidObjectId } = require("mongoose");

const objectId = Joi.string().custom((value, helpers) => {
  if (!value || !String(value).trim()) return value;
  if (!isValidObjectId(value)) return helpers.error("any.invalid");
  return value;
}, "ObjectId validation");

const objectIdArray = Joi.array().items(objectId).optional();

const offeringSchema = Joi.object({
  studyAreaId: objectId.allow(null, "").optional(),
  disciplineId: objectId.allow(null, "").optional(),
  categoryId: objectId.allow(null, "").optional(),
  year: Joi.string().allow("", null).optional(),
  languageIds: objectIdArray,
  feePerYear: Joi.string().allow("").optional(),
  website: Joi.string().allow("").optional(),
});

const baseFields = {
  name: Joi.string().trim().min(1),
  slug: Joi.string().allow("").optional(),
  country: Joi.string().allow("").optional(),
  region: Joi.string().allow("").optional(),
  city: Joi.string().allow("").optional(),
  flag: Joi.string().allow("").optional(),
  ranking: Joi.string().allow("").optional(),
  programs: Joi.array()
    .items(
      Joi.object({
        course: Joi.string().allow("").optional(),
        field: Joi.string().allow("").optional(),
        level: Joi.string().allow("").optional(),
        duration: Joi.string().allow("").optional(),
        language: Joi.string().allow("").optional(),
        tuition: Joi.string().allow("").optional(),
        link: Joi.string().allow("").optional(),
      })
    )
    .optional(),
  offerings: Joi.array().items(offeringSchema).optional(),
  locationId: objectId.allow(null, "").optional(),
  categoryId: objectId.allow(null, "").optional(),
  year: Joi.string().allow("", null).optional(),
  languageIds: objectIdArray,
  feePerYear: Joi.string().allow("").optional(),
  website: Joi.string().allow("").optional(),
  isPublished: Joi.boolean().optional(),
  isVisible: Joi.boolean().optional(),
  sortOrder: Joi.number().optional(),
};

const createSchema = Joi.object({
  ...baseFields,
  name: baseFields.name.required(),
});

const updateSchema = Joi.object(baseFields).min(1);

const updateStatusSchema = Joi.object({
  isVisible: Joi.boolean().required(),
});

module.exports = { createSchema, updateSchema, updateStatusSchema };
