const { parseMoney } = require("./money.utility");
const { computeCurriculumStats } = require("./course-curriculum-stats.utility");
const { stripManualCourseStats } = require("./course-stats.utility");

const JSON_FIELDS = [
  "overview",
  "curriculum",
  "resources",
  "details",
  "instructor",
  "badges",
  "ctaButton",
  "wishlistButton",
  "resourceFileIndexes",
  "lessonVideoTargets",
];
const { normalizeManagedPath } = require("./course-upload.utility");

function parseJsonField(value) {
  if (value == null || value === "") return undefined;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function parseCourseBody(raw = {}) {
  const body = { ...raw };

  if (typeof body.data === "string") {
    const parsed = parseJsonField(body.data);
    if (parsed && typeof parsed === "object") {
      Object.assign(body, parsed);
      delete body.data;
    }
  }

  JSON_FIELDS.forEach((key) => {
    const parsed = parseJsonField(body[key]);
    if (parsed !== undefined) body[key] = parsed;
  });

  if (body.isFree === "true" || body.isFree === "1") body.isFree = true;
  if (body.isFree === "false" || body.isFree === "0") body.isFree = false;
  if (body.isFeatured === "true") body.isFeatured = true;
  if (body.isFeatured === "false") body.isFeatured = false;
  if (body.isPublished === "true" || body.isPublished === "1") body.isPublished = true;
  if (body.isPublished === "false" || body.isPublished === "0") body.isPublished = false;
  if (body.isVisible === "true" || body.isVisible === "1") body.isVisible = true;
  if (body.isVisible === "false" || body.isVisible === "0") body.isVisible = false;
  if (body.status === "true" || body.status === "1") body.status = true;
  if (body.status === "false" || body.status === "0") body.status = false;
  if (body.certificate === "true") body.certificate = true;
  if (body.certificate === "false") body.certificate = false;
  if (body.removeThumbnail === "true" || body.removeThumbnail === "1") body.removeThumbnail = true;

  ["sortOrder", "moduleIndex", "lessonIndex"].forEach(
    (key) => {
      if (body[key] !== undefined && body[key] !== "") body[key] = Number(body[key]);
    }
  );

  stripManualCourseStats(body);

  ["price", "originalPrice"].forEach((key) => {
    if (body[key] !== undefined && body[key] !== "") body[key] = parseMoney(body[key]);
  });

  delete body.slug;

  return body;
}

function resourceId(courseKey, resourceIndex) {
  const key = String(courseKey || "course")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "course";
  return `${key}-r${resourceIndex + 1}`;
}

function normalizeResources(resources, courseKey = "course") {
  if (!Array.isArray(resources)) return [];

  return resources.map((resource, index) => ({
    id: String(resource.id ?? resourceId(courseKey, index)).trim(),
    title: String(resource.title ?? "").trim(),
    description: String(resource.description ?? ""),
    fileUrl: normalizeManagedPath(String(resource.fileUrl ?? "")),
    fileName: String(resource.fileName ?? ""),
    fileSize: Number(resource.fileSize ?? 0),
    mimeType: String(resource.mimeType ?? ""),
    sortOrder: Number(resource.sortOrder ?? index),
    isVisible: resource.isVisible !== false,
  }));
}

function lessonId(courseKey, moduleIndex, lessonIndex) {
  const key = String(courseKey || "course")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "course";
  return `${key}-m${moduleIndex + 1}-l${lessonIndex + 1}`;
}

function normalizeCurriculum(curriculum, courseKey = "course") {
  if (!Array.isArray(curriculum)) return [];

  return curriculum.map((mod, mi) => {
    const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];
    return {
      title: String(mod.title ?? "").trim(),
      sortOrder: Number(mod.sortOrder ?? mi),
      isVisible: mod.isVisible !== false,
      lessons: lessons.map((lesson, li) => {
        const rawLink = String(lesson.linkUrl ?? "").trim();
        const rawVideo = normalizeManagedPath(String(lesson.videoUrl ?? ""));
        let lessonType = lesson.lessonType === "link" ? "link" : lesson.lessonType === "video" ? "video" : null;
        if (!lessonType) {
          lessonType = rawLink && !rawVideo ? "link" : "video";
        }
        return {
          id: String(lesson.id ?? lessonId(courseKey, mi, li)).trim(),
          title: String(lesson.title ?? "").trim(),
          duration: String(lesson.duration ?? ""),
          free: !!lesson.free,
          lessonType,
          videoUrl: lessonType === "video" ? rawVideo : "",
          linkUrl: lessonType === "link" ? rawLink : "",
          vimeoId: String(lesson.vimeoId ?? ""),
          sortOrder: Number(lesson.sortOrder ?? li),
          isVisible: lesson.isVisible !== false,
        };
      }),
    };
  });
}

function countLessons(curriculum) {
  if (!Array.isArray(curriculum)) return 0;
  return curriculum.reduce((n, m) => n + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0);
}

function syncFlatFields(payload) {
  const data = { ...payload };

  if (data.instructor && typeof data.instructor === "object") {
    if (data.instructor.name) data.instructorName = data.instructor.name;
    if (data.instructor.instructorId) data.instructorId = data.instructor.instructorId;
  }

  if (data.details && typeof data.details === "object") {
    if (data.details.skillLevel) data.level = data.details.skillLevel;
    if (data.details.language) data.language = data.details.language;
  }

  if (data.overview?.description && !data.description) {
    data.description = data.overview.description;
  }
  if (data.description && data.overview && !data.overview.description) {
    data.overview.description = data.description;
  }

  if (Array.isArray(data.curriculum)) {
    const stats = computeCurriculumStats(data.curriculum);
    data.lessonCount = stats.lessonCount;
    data.durationHours = stats.durationHours;
    if (!data.details) data.details = {};
    data.details.lessonCount = stats.lessonCount;
    data.details.durationHours = stats.durationHours;
    if (stats.durationHours > 0) {
      data.duration = `${stats.durationHours} hours`;
    }
  }

  return data;
}

module.exports = {
  parseCourseBody,
  normalizeCurriculum,
  normalizeResources,
  countLessons,
  syncFlatFields,
  lessonId,
  resourceId,
};
