const Joi = require("joi");

const createSchema = Joi.object({}).unknown(true);
const updateSchema = Joi.object({}).unknown(true);

module.exports = { createSchema, updateSchema };
