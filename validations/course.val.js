const Joi = require("joi");

const lessonSchema = Joi.object({
  id: Joi.string().optional(),
  title: Joi.string().required(),
  duration: Joi.string().allow("").optional(),
  free: Joi.boolean().optional(),
  lessonType: Joi.string().valid("video", "link").optional(),
  videoUrl: Joi.string().allow("").optional(),
  linkUrl: Joi.string().allow("").optional(),
  vimeoId: Joi.string().allow("").optional(),
  sortOrder: Joi.number().optional(),
  isVisible: Joi.boolean().optional(),
});

const moduleSchema = Joi.object({
  title: Joi.string().required(),
  sortOrder: Joi.number().optional(),
  isVisible: Joi.boolean().optional(),
  lessons: Joi.array().items(lessonSchema).default([]),
});

const overviewSchema = Joi.object({
  headline: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  outcomes: Joi.array().items(Joi.string()).optional(),
});

const detailsSchema = Joi.object({
  skillLevel: Joi.string().allow("").optional(),
  language: Joi.string().allow("").optional(),
  certificate: Joi.boolean().optional(),
  access: Joi.string().allow("").optional(),
});

const resourceSchema = Joi.object({
  id: Joi.string().optional(),
  title: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  fileUrl: Joi.string().allow("").optional(),
  fileName: Joi.string().allow("").optional(),
  fileSize: Joi.number().min(0).optional(),
  mimeType: Joi.string().allow("").optional(),
  sortOrder: Joi.number().optional(),
  isVisible: Joi.boolean().optional(),
});

const instructorSchema = Joi.object({
  instructorId: Joi.string().allow("", null).optional(),
  name: Joi.string().allow("").optional(),
  role: Joi.string().allow("").optional(),
  bio: Joi.string().allow("").optional(),
  avatar: Joi.string().allow("").optional(),
});

const baseFields = {
  title: Joi.string(),
  fieldId: Joi.string(),
  description: Joi.string().allow("").optional(),
  shortDescription: Joi.string().allow("").optional(),
  category: Joi.string().allow("").optional(),
  level: Joi.string().allow("").optional(),
  language: Joi.string().allow("").optional(),
  duration: Joi.string().allow("").optional(),
  color: Joi.string().allow("").optional(),
  badge: Joi.string().allow("").optional(),
  certificate: Joi.boolean().optional(),
  access: Joi.string().allow("").optional(),
  instructorId: Joi.string().allow("", null).optional(),
  instructorName: Joi.string().allow("").optional(),
  thumbnail: Joi.string().allow("").optional(),
  previewVideoUrl: Joi.string().allow("").optional(),
  price: Joi.number().min(0).precision(2).optional(),
  originalPrice: Joi.number().min(0).precision(2).optional(),
  isFree: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  isPublished: Joi.boolean().optional(),
  isVisible: Joi.boolean().optional(),
  sortOrder: Joi.number().optional(),
  status: Joi.boolean().optional(),
  overview: overviewSchema.optional(),
  curriculum: Joi.array().items(moduleSchema).optional(),
  resources: Joi.array().items(resourceSchema).optional(),
  resourceFileIndexes: Joi.array().items(Joi.number().integer().min(0)).optional(),
  lessonVideoTargets: Joi.array()
    .items(
      Joi.object({
        moduleIndex: Joi.number().integer().min(0).required(),
        lessonIndex: Joi.number().integer().min(0).required(),
        lessonId: Joi.string().allow("").optional(),
      })
    )
    .optional(),
  details: detailsSchema.optional(),
  instructor: instructorSchema.optional(),
  removeThumbnail: Joi.boolean().optional(),
  moduleIndex: Joi.number().integer().min(0).optional(),
  lessonIndex: Joi.number().integer().min(0).optional(),
  lessonId: Joi.string().allow("").optional(),
};

const createSchema = Joi.object({
  ...baseFields,
  title: Joi.string().required(),
  fieldId: Joi.string().required(),
});

const updateSchema = Joi.object(baseFields).min(1);

const uploadLessonVideoSchema = Joi.object({
  moduleIndex: Joi.number().integer().min(0).required(),
  lessonIndex: Joi.number().integer().min(0).required(),
  lessonId: Joi.string().allow("").optional(),
});

module.exports = { createSchema, updateSchema, uploadLessonVideoSchema };
