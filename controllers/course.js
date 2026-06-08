// controllers/course.js
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Course = require("../models/course.model");
const Field = require("../models/field.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");
const PaginationUtility = require("../utilities/pagination_utility.js");
const { parseCourseBody, normalizeCurriculum, normalizeResources, syncFlatFields } = require("../utilities/course.utility");
const {
  collectPendingFiles,
  commitPendingFiles,
  rollbackPendingFiles,
  rollbackCommittedPaths,
  deleteByPublicPath,
  applyLessonVideoToBody,
  applyResourceFilesToBody,
  applyCourseFields,
  cleanupCurriculumVideos,
  cleanupRemovedResources,
  resolveResourceFileIndexes,
  serializeCurriculum,
  setLessonVideoUrl,
  getLessonVideoUrl,
  findLessonIndices,
  shouldRemoveThumbnail,
} = require("../utilities/course-upload.utility");
const { toPublicPath } = require("../middlewares/upload.middleware");

const { THUMBNAIL_MAX_BYTES, VIDEO_MAX_BYTES, RESOURCE_MAX_BYTES } = require("../middlewares/upload.middleware");

function formatMb(bytes) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function handleUploadError(err, res) {
  if (err?.code === "LIMIT_FILE_SIZE") {
    const field = err?.field || "file";
    const isVideo = field === "video";
    const isResource = field === "resourceFiles";
    const maxBytes = isVideo
      ? VIDEO_MAX_BYTES
      : isResource
        ? RESOURCE_MAX_BYTES
        : THUMBNAIL_MAX_BYTES;
    const maxLabel = formatMb(maxBytes);
    return Response.errorResponse(res, 400, {
      message: `File is too large. Max ${field} size is ${maxLabel}.`,
    });
  }
  if (err?.message) {
    return Response.errorResponse(res, 400, { message: err.message });
  }
  return Response.errorResponse(res, 500, err);
}

function buildCoursePayload(raw, { courseKey } = {}) {
  let body = syncFlatFields(parseCourseBody(raw));

  const key = courseKey || body.title || "course";

  if (body.curriculum !== undefined) {
    body.curriculum = normalizeCurriculum(body.curriculum, key);
  }

  if (body.resources !== undefined) {
    body.resources = normalizeResources(body.resources, key);
  }

  if (body.overview && body.description && !body.overview.description) {
    body.overview.description = body.description;
  }

  if (body.instructorName && body.instructor) {
    body.instructor = { ...body.instructor, name: body.instructor.name || body.instructorName };
  } else if (body.instructorName && !body.instructor) {
    body.instructor = { name: body.instructorName };
  }

  if (body.details) {
    body.details = {
      skillLevel: body.details.skillLevel || body.level || "Beginner",
      language: body.details.language || body.language || "Somali",
      durationHours: body.details.durationHours ?? body.durationHours ?? 0,
      lessonCount: body.details.lessonCount ?? body.lessonCount ?? 0,
      certificate: body.details.certificate ?? body.certificate ?? true,
      access: body.details.access || body.access || "1 Year",
    };
    body.level = body.details.skillLevel;
    body.language = body.details.language;
    body.durationHours = body.details.durationHours;
    body.certificate = body.details.certificate;
    body.access = body.details.access;
  }

  return body;
}

function applyCommittedUploads(body, committed) {
  if (committed.thumbnail) body.thumbnail = committed.thumbnail;
  return body;
}

function validatePendingFileSizes(pending) {
  for (const entry of pending) {
    if (entry.type !== "resource") continue;
    if (entry.file.size > RESOURCE_MAX_BYTES) {
      const err = new Error(`File is too large. Max resourceFiles size is ${formatMb(RESOURCE_MAX_BYTES)}.`);
      err.code = "LIMIT_FILE_SIZE";
      err.field = "resourceFiles";
      throw err;
    }
  }
}

async function validateField(fieldId) {
  if (!isValidObjectId(fieldId)) {
    return { error: "fieldId is required and must be a valid id" };
  }
  const field = await Field.findOne({ _id: fieldId, del_status: "Live" });
  if (!field) return { error: "Field not found" };
  return { field };
}

module.exports = {
  create: async (req, res) => {
    const pendingFiles = collectPendingFiles(req);
    let committed = null;

    try {
      let body = buildCoursePayload(req.body);
      const { fieldId } = body;

      const fieldCheck = await validateField(fieldId);
      if (fieldCheck.error) {
        rollbackPendingFiles(pendingFiles);
        return Response.errorResponse(res, fieldCheck.error.includes("not found") ? 404 : 400, {
          message: fieldCheck.error,
        });
      }

      if (pendingFiles.length) {
        validatePendingFileSizes(pendingFiles);
        committed = commitPendingFiles(pendingFiles);
        body = applyCommittedUploads(body, committed);
        if (committed.video) {
          const applied = applyLessonVideoToBody(body, committed.video, null);
          body = applied.body;
        }
        if (committed.resources?.length) {
          body = applyResourceFilesToBody(
            body,
            committed.resources,
            resolveResourceFileIndexes(body, committed.resources.length)
          );
        }
      }

      const course = new Course(body);
      if (body.curriculum !== undefined) {
        course.markModified("curriculum");
      }
      if (body.resources !== undefined) {
        course.markModified("resources");
      }
      const saved = await course.save();
      return Response.successResponse(res, 201, saved);
    } catch (err) {
      if (committed) rollbackCommittedPaths(committed);
      rollbackPendingFiles(pendingFiles);
      if (err?.code === "LIMIT_FILE_SIZE") return handleUploadError(err, res);
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getAll: async (req, res) => {
    try {
      const filter = { del_status: "Live" };
      if (req.query.isFree === "true") filter.isFree = true;
      if (req.query.isFeatured === "true") filter.isFeatured = true;
      if (req.query.category) filter.category = req.query.category;

      const total = await Course.countDocuments(filter);
      const { pagination, skip } = await PaginationUtility.paginationParams(req, total);

      if (total === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      if (pagination.page > pagination.pages) {
        return Response.customResponse(res, 200, ResponseMessage.OUTOF_DATA);
      }

      pagination.data = await Course.find(filter)
        .populate("fieldId", "name icon")
        .populate("instructor.instructorId", "email profile.full_name profile.avatar_url")
        .sort({ sortOrder: 1, created_at: -1 })
        .skip(skip)
        .limit(pagination.pageSize);

      if (!pagination.data || pagination.data.length === 0) {
        return Response.customResponse(res, 200, ResponseMessage.NO_DATA);
      }

      return Response.paginationResponse(res, 200, pagination);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOne({ _id: id, del_status: "Live" })
        .populate("fieldId", "name icon")
        .populate("instructor.instructorId", "email profile.full_name profile.avatar_url");
      if (!course) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      return Response.successResponse(res, 200, course);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  update: async (req, res) => {
    const pendingFiles = collectPendingFiles(req);
    let committed = null;

    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        rollbackPendingFiles(pendingFiles);
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOne({ _id: id, del_status: "Live" });
      if (!course) {
        rollbackPendingFiles(pendingFiles);
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      const oldThumbnail = course.thumbnail;
      const oldCurriculum = course.curriculum ? JSON.parse(JSON.stringify(course.curriculum)) : [];
      const oldResources = course.resources ? JSON.parse(JSON.stringify(course.resources)) : [];

      let body = buildCoursePayload(req.body, { courseKey: course._id.toString() });
      const removeThumbnail = shouldRemoveThumbnail(body);
      delete body.removeThumbnail;

      if (body.fieldId !== undefined) {
        const fieldCheck = await validateField(body.fieldId);
        if (fieldCheck.error) {
          rollbackPendingFiles(pendingFiles);
          return Response.errorResponse(res, fieldCheck.error.includes("not found") ? 404 : 400, {
            message: fieldCheck.error,
          });
        }
      }

      let replacedLessonVideoUrl = null;

      if (pendingFiles.length) {
        validatePendingFileSizes(pendingFiles);
        committed = commitPendingFiles(pendingFiles);
        body = applyCommittedUploads(body, committed);
        if (committed.video) {
          const applied = applyLessonVideoToBody(body, committed.video, course);
          body = applied.body;
          replacedLessonVideoUrl = applied.replacedVideoUrl;
        }
        if (committed.resources?.length) {
          body = applyResourceFilesToBody(
            body,
            committed.resources,
            resolveResourceFileIndexes(body, committed.resources.length)
          );
        }
      }

      if (removeThumbnail && !committed?.thumbnail) {
        body.thumbnail = "";
      }

      delete body.moduleIndex;
      delete body.lessonIndex;
      delete body.lessonId;

      applyCourseFields(course, body);
      const updated = await course.save();

      if (removeThumbnail && oldThumbnail) {
        deleteByPublicPath(oldThumbnail);
      } else if (committed?.thumbnail && oldThumbnail && oldThumbnail !== committed.thumbnail) {
        deleteByPublicPath(oldThumbnail);
      }

      const keepUrls = [
        committed?.video,
        committed?.thumbnail,
        ...(committed?.resources || []).map((resource) => resource.fileUrl),
      ].filter(Boolean);
      if (body.curriculum !== undefined || committed?.video) {
        cleanupCurriculumVideos(oldCurriculum, updated.curriculum, { keepUrls });
      } else if (replacedLessonVideoUrl && committed?.video) {
        deleteByPublicPath(replacedLessonVideoUrl);
      }

      if (body.resources !== undefined || committed?.resources?.length) {
        cleanupRemovedResources(oldResources, updated.resources, { keepUrls });
      }

      return Response.successResponse(res, 200, updated);
    } catch (err) {
      if (committed) rollbackCommittedPaths(committed);
      rollbackPendingFiles(pendingFiles);
      if (err?.code === "LIMIT_FILE_SIZE") return handleUploadError(err, res);
      if (err?.code === 11000) return Response.customResponse(res, 409, ResponseMessage.DATA_EXISTS);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  uploadThumbnail: async (req, res) => {
    try {
      if (!req.file?.filename) {
        return Response.errorResponse(res, 400, { message: "thumbnail file is required" });
      }
      const thumbnail = toPublicPath(req.file.filename, "thumbnail");
      return Response.successResponse(res, 200, { thumbnail });
    } catch (err) {
      if (req.file?.path) deleteByPublicPath(toPublicPath(req.file.filename, "thumbnail"));
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  uploadVideo: async (req, res) => {
    try {
      if (!req.file?.filename) {
        return Response.errorResponse(res, 400, { message: "video file is required" });
      }
      const videoUrl = toPublicPath(req.file.filename, "video");
      return Response.successResponse(res, 200, { videoUrl });
    } catch (err) {
      if (req.file?.filename) deleteByPublicPath(toPublicPath(req.file.filename, "video"));
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  uploadLessonVideo: async (req, res) => {
    const pending = collectPendingFiles(req);
    let committedVideoUrl = null;

    try {
      const { id } = req.params;
      const body = parseCourseBody(req.body);
      const moduleIndex = body.moduleIndex;
      const lessonIndex = body.lessonIndex;
      const lessonId = body.lessonId;

      if (!isValidObjectId(id)) {
        rollbackPendingFiles(pending);
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      if (!pending.length) {
        return Response.errorResponse(res, 400, { message: "video file is required" });
      }

      const course = await Course.findOne({ _id: id, del_status: "Live" });
      if (!course) {
        rollbackPendingFiles(pending);
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      const target = findLessonIndices(course.curriculum, { moduleIndex, lessonIndex, lessonId });
      if (!target) {
        rollbackPendingFiles(pending);
        return Response.errorResponse(res, 400, { message: "Invalid moduleIndex, lessonIndex, or lessonId" });
      }

      const oldVideoUrl = getLessonVideoUrl(course.curriculum, target.mi, target.li);
      committedVideoUrl = commitPendingFiles(pending).video;

      const saved = setLessonVideoUrl(course, target.mi, target.li, committedVideoUrl);
      if (!saved) {
        rollbackPendingFiles(pending);
        if (committedVideoUrl) deleteByPublicPath(committedVideoUrl);
        return Response.errorResponse(res, 400, { message: "Lesson not found in curriculum" });
      }

      await course.save();

      if (oldVideoUrl && oldVideoUrl !== committedVideoUrl) {
        deleteByPublicPath(oldVideoUrl);
      }

      const mod = serializeCurriculum(course.curriculum)[target.mi];
      const lesson = mod?.lessons?.[target.li];

      return Response.successResponse(res, 200, {
        videoUrl: committedVideoUrl,
        lessonId: lesson?.id,
        moduleTitle: mod?.title,
        lessonTitle: lesson?.title,
        course: course.toJSON ? course.toJSON() : course,
      });
    } catch (err) {
      if (committedVideoUrl) deleteByPublicPath(committedVideoUrl);
      rollbackPendingFiles(pending);
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOneAndUpdate(
        { _id: id, del_status: "Live" },
        { status },
        { new: true }
      );
      if (!course) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      return Response.successResponse(res, 200, course);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOne({ _id: id, del_status: "Live" });
      if (!course) return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);

      course.del_status = "Deleted";
      await course.save();
      return Response.customResponse(res, 200, "Deleted successfully");
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  handleUploadError,
};
