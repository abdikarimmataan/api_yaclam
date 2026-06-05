const Joi = require("joi");
const { DEMAND_LEVELS } = require("../utilities/roadmap.utility");

const stepSchema = Joi.object({
  title: Joi.string().allow("").optional(),
  detail: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  order: Joi.number().optional(),
  isVisible: Joi.boolean().optional(),
});

const ctaButtonSchema = Joi.object({
  label: Joi.string().allow("").optional(),
  url: Joi.string().allow("").optional(),
  isVisible: Joi.boolean().optional(),
});

const baseFields = {
  title: Joi.string().trim().min(1),
  description: Joi.string().allow("").optional(),
  icon: Joi.string().allow("").optional(),
  skills: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  skillsYoullMaster: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  demand: Joi.string()
    .valid(...DEMAND_LEVELS)
    .optional(),
  marketDemand: Joi.string().optional(),
  salary: Joi.string().allow("").optional(),
  salaryRange: Joi.string().allow("").optional(),
  months: Joi.number().min(0).optional(),
  timeToJobReady: Joi.number().min(0).optional(),
  timeToJobReadyMonths: Joi.number().min(0).optional(),
  skillsRequired: Joi.number().min(0).optional(),
  skillsRequiredCount: Joi.number().min(0).optional(),
  steps: Joi.array().items(stepSchema).optional(),
  learningPath: Joi.array().items(stepSchema).optional(),
  ctaButton: ctaButtonSchema.optional(),
  isPublished: Joi.boolean().optional(),
  isVisible: Joi.boolean().optional(),
  sortOrder: Joi.number().optional(),
  status: Joi.boolean().optional(),
};

const createSchema = Joi.object({
  ...baseFields,
  title: baseFields.title.required(),
});

const updateSchema = Joi.object(baseFields).min(1);

const updateStatusSchema = Joi.object({
  status: Joi.boolean().required(),
});

module.exports = { createSchema, updateSchema, updateStatusSchema };
