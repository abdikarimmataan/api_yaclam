const Joi = require("joi");

const pageFields = {
  title: Joi.string().trim().allow("").optional(),
  subtitle: Joi.string().allow("").optional(),
  emptyStateText: Joi.string().allow("").optional(),
  isVisible: Joi.boolean().optional(),
};

const createSchema = Joi.object(pageFields).min(1);
const updateSchema = Joi.object(pageFields).min(1);

module.exports = { createSchema, updateSchema };
