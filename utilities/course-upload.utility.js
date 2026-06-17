const path = require("path");
const fs = require("fs");
const {
  toPublicPath,
  COURSE_THUMBNAILS,
  COURSE_VIDEOS,
  COURSE_RESOURCES,
} = require("../middlewares/upload.middleware");

function normalizeManagedPath(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  const match = trimmed.match(/\/uploads\/courses\/(?:videos|thumbnails|resources)\/[^?#\s]+/i);
  if (match) return match[0];
  if (trimmed.startsWith("/uploads/courses/")) return trimmed.split("?")[0];
  return "";
}

function publicPathToAbsolute(publicPath) {
  const normalized = normalizeManagedPath(publicPath);
  if (!normalized) return null;
  const rel = normalized.replace(/^\/uploads\/?/, "");
  const abs = path.join(path.join(__dirname, "..", "uploads"), rel);
  const uploadsRoot = path.resolve(path.join(__dirname, "..", "uploads"));
  const resolved = path.resolve(abs);
  if (!resolved.startsWith(uploadsRoot)) return null;
  return resolved;
}

function isManagedUploadPath(url) {
  return Boolean(normalizeManagedPath(url));
}

function safeUnlink(absPath) {
  if (!absPath || !fs.existsSync(absPath)) return;
  try {
    fs.unlinkSync(absPath);
  } catch {
    /* ignore */
  }
}

function deleteByPublicPath(publicPath) {
  safeUnlink(publicPathToAbsolute(publicPath));
}

function serializeCurriculum(curriculum) {
  if (!curriculum) return [];
  if (Array.isArray(curriculum)) {
    const raw = curriculum.map((mod) => (mod?.toObject ? mod.toObject() : mod));
    return JSON.parse(JSON.stringify(raw));
  }
  return JSON.parse(JSON.stringify(curriculum));
}

function collectCurriculumVideoUrls(curriculum) {
  const urls = new Set();
  for (const mod of serializeCurriculum(curriculum)) {
    for (const lesson of mod.lessons || []) {
      const normalized = normalizeManagedPath(lesson.videoUrl);
      if (normalized) urls.add(normalized);
    }
  }
  return urls;
}

function diffRemovedCurriculumVideos(oldCurriculum, newCurriculum) {
  const oldUrls = collectCurriculumVideoUrls(oldCurriculum);
  const newUrls = collectCurriculumVideoUrls(newCurriculum);
  return [...oldUrls].filter((u) => !newUrls.has(u));
}

function lessonVideoMap(curriculum) {
  const map = new Map();
  for (const mod of serializeCurriculum(curriculum)) {
    for (const lesson of mod.lessons || []) {
      if (lesson?.id) map.set(String(lesson.id), normalizeManagedPath(String(lesson.videoUrl ?? "")));
    }
  }
  return map;
}

function diffChangedCurriculumVideos(oldCurriculum, newCurriculum) {
  const urlsToDelete = new Set();
  const oldSerialized = serializeCurriculum(oldCurriculum);
  const newSerialized = serializeCurriculum(newCurriculum);

  const oldMap = lessonVideoMap(oldSerialized);
  const newMap = lessonVideoMap(newSerialized);
  for (const [id, oldUrl] of oldMap) {
    if (!oldUrl) continue;
    const newUrl = newMap.has(id) ? newMap.get(id) : "";
    if (newUrl !== oldUrl) urlsToDelete.add(oldUrl);
  }

  for (let mi = 0; mi < oldSerialized.length; mi++) {
    const oldLessons = oldSerialized[mi]?.lessons || [];
    const newLessons = newSerialized[mi]?.lessons || [];
    for (let li = 0; li < oldLessons.length; li++) {
      const oldUrl = normalizeManagedPath(String(oldLessons[li]?.videoUrl ?? ""));
      const newUrl = normalizeManagedPath(String(newLessons[li]?.videoUrl ?? ""));
      if (oldUrl && oldUrl !== newUrl) urlsToDelete.add(oldUrl);
    }
  }

  for (const url of diffRemovedCurriculumVideos(oldSerialized, newSerialized)) {
    urlsToDelete.add(url);
  }

  return [...urlsToDelete];
}

function findLessonIndices(curriculum, { moduleIndex, lessonIndex, lessonId }) {
  const serialized = serializeCurriculum(curriculum);
  if (lessonId) {
    for (let mi = 0; mi < serialized.length; mi++) {
      const li = (serialized[mi].lessons || []).findIndex((l) => String(l.id) === String(lessonId));
      if (li >= 0) return { mi, li };
    }
  }
  const mi = Number(moduleIndex);
  const li = Number(lessonIndex);
  if (!Number.isNaN(mi) && !Number.isNaN(li)) return { mi, li };
  return null;
}

function getLessonVideoUrl(curriculum, moduleIndex, lessonIndex) {
  const mod = serializeCurriculum(curriculum)[moduleIndex];
  return normalizeManagedPath(String(mod?.lessons?.[lessonIndex]?.videoUrl ?? ""));
}

function setCourseCurriculum(course, curriculum) {
  course.curriculum = serializeCurriculum(curriculum);
  course.markModified("curriculum");
}

function setLessonVideoUrl(course, moduleIndex, lessonIndex, videoUrl, duration) {
  const curriculum = serializeCurriculum(course.curriculum);
  if (!curriculum[moduleIndex]?.lessons?.[lessonIndex]) return false;
  curriculum[moduleIndex].lessons[lessonIndex].videoUrl = normalizeManagedPath(videoUrl);
  if (duration !== undefined && duration !== null) {
    curriculum[moduleIndex].lessons[lessonIndex].duration = String(duration).trim();
  }
  setCourseCurriculum(course, curriculum);
  return true;
}

function applyPreviewVideoToBody(body, committedVideo, course) {
  if (!committedVideo) return { body, replacedVideoUrl: null };

  const normalizedVideo = normalizeManagedPath(committedVideo) || committedVideo;
  const replacedVideoUrl =
    normalizeManagedPath(course?.previewVideoUrl || body.previewVideoUrl || "") || null;

  body.previewVideoUrl = normalizedVideo;
  delete body.moduleIndex;
  delete body.lessonIndex;
  delete body.lessonId;

  return { body, replacedVideoUrl };
}

function applyLessonVideoToBody(body, committedVideo, course) {
  if (!committedVideo) return { body, replacedVideoUrl: null };

  const normalizedVideo = normalizeManagedPath(committedVideo) || committedVideo;
  if (!Array.isArray(body.curriculum)) {
    body.curriculum = serializeCurriculum(course?.curriculum);
  }

  const target = findLessonIndices(body.curriculum, body);
  if (target) {
    const replacedVideoUrl = getLessonVideoUrl(course?.curriculum, target.mi, target.li) || null;
    body.curriculum[target.mi].lessons[target.li].videoUrl = normalizedVideo;
    delete body.moduleIndex;
    delete body.lessonIndex;
    delete body.lessonId;
    return { body, replacedVideoUrl };
  }

  if (body.curriculum[0]?.lessons?.[0]) {
    const replacedVideoUrl = getLessonVideoUrl(course?.curriculum, 0, 0) || null;
    body.curriculum[0].lessons[0].videoUrl = normalizedVideo;
    return { body, replacedVideoUrl };
  }

  return { body, replacedVideoUrl: null };
}

function setCourseResources(course, resources) {
  course.resources = serializeResources(resources);
  course.markModified("resources");
}

function applyCourseFields(course, body) {
  const skip = new Set([
    "moduleIndex",
    "lessonIndex",
    "lessonId",
    "lessonVideoTargets",
    "removeThumbnail",
    "removeVideo",
    "resourceFileIndexes",
  ]);
  const { curriculum, resources, ...rest } = body;

  Object.entries(rest).forEach(([key, value]) => {
    if (skip.has(key) || value === undefined) return;
    course.set(key, value);
  });

  if (curriculum !== undefined) {
    setCourseCurriculum(course, curriculum);
  }

  if (resources !== undefined) {
    setCourseResources(course, resources);
  }
}

function cleanupCurriculumVideos(oldCurriculum, newCurriculum, { keepUrls = [] } = {}) {
  const keep = new Set(keepUrls.map((u) => normalizeManagedPath(u)).filter(Boolean));
  const toDelete = diffChangedCurriculumVideos(oldCurriculum, newCurriculum);
  toDelete.forEach((url) => {
    if (!keep.has(url)) deleteByPublicPath(url);
  });
}

function serializeResources(resources) {
  if (!resources) return [];
  if (Array.isArray(resources)) {
    const raw = resources.map((item) => (item?.toObject ? item.toObject() : item));
    return JSON.parse(JSON.stringify(raw));
  }
  return JSON.parse(JSON.stringify(resources));
}

function collectResourceFileUrls(resources) {
  const urls = new Set();
  for (const resource of serializeResources(resources)) {
    const normalized = normalizeManagedPath(resource.fileUrl);
    if (normalized) urls.add(normalized);
  }
  return urls;
}

function diffRemovedResourceFiles(oldResources, newResources) {
  const oldUrls = collectResourceFileUrls(oldResources);
  const newUrls = collectResourceFileUrls(newResources);
  return [...oldUrls].filter((u) => !newUrls.has(u));
}

function cleanupRemovedResources(oldResources, newResources, { keepUrls = [] } = {}) {
  const keep = new Set(keepUrls.map((u) => normalizeManagedPath(u)).filter(Boolean));
  const toDelete = diffRemovedResourceFiles(oldResources, newResources);
  toDelete.forEach((url) => {
    if (!keep.has(url)) deleteByPublicPath(url);
  });
}

function resolveResourceFileIndexes(body, fileCount) {
  if (!fileCount) return [];

  const raw = body.resourceFileIndexes;
  if (Array.isArray(raw)) {
    return raw.map((value) => Number(value)).filter((value) => !Number.isNaN(value));
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((value) => Number(value)).filter((value) => !Number.isNaN(value));
      }
    } catch {
      /* fall through */
    }
  }

  if (!Array.isArray(body.resources)) return [];
  return body.resources.reduce((indexes, resource, index) => {
    if (!normalizeManagedPath(resource?.fileUrl)) indexes.push(index);
    return indexes;
  }, []);
}

function applyLessonVideosToBody(body, committedVideos, targetsRaw, course) {
  if (!committedVideos?.length) return { body, replacedVideoUrls: [] };

  const targets = parseLessonVideoTargets(targetsRaw);
  if (!targets.length) return { body, replacedVideoUrls: [] };

  if (!Array.isArray(body.curriculum)) {
    body.curriculum = serializeCurriculum(course?.curriculum);
  }

  const replacedVideoUrls = [];
  committedVideos.forEach((videoUrl, fileIndex) => {
    const target = targets[fileIndex];
    if (!target) return;

    const indices = findLessonIndices(body.curriculum, target);
    if (!indices) return;

    const oldUrl =
      getLessonVideoUrl(body.curriculum, indices.mi, indices.li) ||
      getLessonVideoUrl(course?.curriculum, indices.mi, indices.li);
    if (oldUrl) replacedVideoUrls.push(oldUrl);

    const normalizedVideo = normalizeManagedPath(videoUrl) || videoUrl;
    if (!body.curriculum[indices.mi]?.lessons?.[indices.li]) return;
    body.curriculum[indices.mi].lessons[indices.li].videoUrl = normalizedVideo;
  });

  delete body.lessonVideoTargets;
  return { body, replacedVideoUrls };
}

function parseLessonVideoTargets(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* fall through */
    }
  }
  return [];
}

function applyResourceFilesToBody(body, committedResources, resourceFileIndexes) {
  if (!committedResources?.length) return body;
  if (!Array.isArray(body.resources)) body.resources = [];

  const indexes = resourceFileIndexes.length
    ? resourceFileIndexes
    : resolveResourceFileIndexes(body, committedResources.length);

  committedResources.forEach((committed, fileIndex) => {
    const resourceIndex = indexes[fileIndex];
    if (resourceIndex == null || !body.resources[resourceIndex]) return;

    body.resources[resourceIndex] = {
      ...body.resources[resourceIndex],
      fileUrl: committed.fileUrl,
      fileName: committed.fileName,
      fileSize: committed.fileSize,
      mimeType: committed.mimeType,
    };
  });

  delete body.resourceFileIndexes;
  return body;
}

function collectPendingFiles(req) {
  const pending = [];
  const thumb = req.file?.fieldname === "thumbnail" ? req.file : req.files?.thumbnail?.[0];
  const video = req.file?.fieldname === "video" ? req.file : req.files?.video?.[0];
  const resourceFiles = req.files?.resourceFiles || [];
  const lessonVideos = req.files?.lessonVideos || [];

  if (thumb?.path) pending.push({ file: thumb, type: "thumbnail" });
  if (video?.path) pending.push({ file: video, type: "video" });
  resourceFiles.forEach((file) => {
    if (file?.path) pending.push({ file, type: "resource" });
  });
  lessonVideos.forEach((file) => {
    if (file?.path) pending.push({ file, type: "lessonVideo" });
  });
  return pending;
}

function commitPendingFile(entry) {
  const destDir =
    entry.type === "video" || entry.type === "lessonVideo"
      ? COURSE_VIDEOS
      : entry.type === "resource"
        ? COURSE_RESOURCES
        : COURSE_THUMBNAILS;
  const destPath = path.join(destDir, entry.file.filename);
  fs.mkdirSync(destDir, { recursive: true });
  if (entry.file.path !== destPath) {
    fs.renameSync(entry.file.path, destPath);
  }

  if (entry.type === "resource") {
    return {
      fileUrl: toPublicPath(entry.file.filename, "resource"),
      fileName: entry.file.originalname || entry.file.filename,
      fileSize: entry.file.size || 0,
      mimeType: entry.file.mimetype || "",
    };
  }

  const pathType = entry.type === "lessonVideo" ? "video" : entry.type;
  return toPublicPath(entry.file.filename, pathType);
}

function commitPendingFiles(pending) {
  const committed = { resources: [], lessonVideos: [] };
  for (const entry of pending) {
    const result = commitPendingFile(entry);
    if (entry.type === "resource") {
      committed.resources.push(result);
    } else if (entry.type === "lessonVideo") {
      committed.lessonVideos.push(result);
    } else {
      committed[entry.type] = result;
    }
  }
  return committed;
}

function rollbackPendingFiles(pending) {
  for (const entry of pending) {
    safeUnlink(entry.file.path);
  }
}

function rollbackCommittedPaths(pathsByType) {
  if (pathsByType.thumbnail) deleteByPublicPath(pathsByType.thumbnail);
  if (pathsByType.video) deleteByPublicPath(pathsByType.video);
  for (const resource of pathsByType.resources || []) {
    deleteByPublicPath(resource.fileUrl);
  }
  for (const videoUrl of pathsByType.lessonVideos || []) {
    deleteByPublicPath(videoUrl);
  }
}

function shouldRemoveThumbnail(body) {
  return body.removeThumbnail === true || body.removeThumbnail === "true" || body.thumbnail === "";
}

module.exports = {
  normalizeManagedPath,
  publicPathToAbsolute,
  isManagedUploadPath,
  deleteByPublicPath,
  serializeResources,
  collectResourceFileUrls,
  diffRemovedResourceFiles,
  cleanupRemovedResources,
  resolveResourceFileIndexes,
  applyResourceFilesToBody,
  serializeCurriculum,
  collectCurriculumVideoUrls,
  diffRemovedCurriculumVideos,
  diffChangedCurriculumVideos,
  findLessonIndices,
  getLessonVideoUrl,
  setCourseCurriculum,
  setCourseResources,
  setLessonVideoUrl,
  applyPreviewVideoToBody,
  applyLessonVideoToBody,
  applyLessonVideosToBody,
  parseLessonVideoTargets,
  applyCourseFields,
  cleanupCurriculumVideos,
  collectPendingFiles,
  commitPendingFile,
  commitPendingFiles,
  rollbackPendingFiles,
  rollbackCommittedPaths,
  shouldRemoveThumbnail,
};
