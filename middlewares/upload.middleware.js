const path = require("path");
const fs = require("fs");
const multer = require("multer");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");
const COURSE_THUMBNAILS = path.join(UPLOAD_ROOT, "courses", "thumbnails");
const COURSE_VIDEOS = path.join(UPLOAD_ROOT, "courses", "videos");
const COURSE_RESOURCES = path.join(UPLOAD_ROOT, "courses", "resources");
const COURSE_TMP = path.join(UPLOAD_ROOT, "courses", "_tmp");
const INSTRUCTOR_PHOTOS = path.join(UPLOAD_ROOT, "instructors", "photos");

/** Max upload sizes — adjust here if needed */
const THUMBNAIL_MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const VIDEO_MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB
const RESOURCE_MAX_BYTES = 100 * 1024 * 1024; // 100 MB

[COURSE_THUMBNAILS, COURSE_VIDEOS, COURSE_RESOURCES, COURSE_TMP, INSTRUCTOR_PHOTOS].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

function safeFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const base = path
    .basename(originalname, ext)
    .replace(/[^a-z0-9-_]/gi, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return `${Date.now()}-${base || "file"}${ext}`;
}

function diskStorage(destDir) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destDir),
    filename: (_req, file, cb) => cb(null, safeFilename(file.originalname)),
  });
}

const thumbnailStorage = diskStorage(COURSE_THUMBNAILS);
const instructorPhotoStorage = diskStorage(INSTRUCTOR_PHOTOS);
const videoStorage = diskStorage(COURSE_VIDEOS);
const tempStorage = diskStorage(COURSE_TMP);

const imageFilter = (_req, file, cb) => {
  const ok = /image\/(jpeg|jpg|png|webp|gif)/i.test(file.mimetype);
  cb(ok ? null : new Error("Only image files (jpeg, png, webp, gif) are allowed"), ok);
};

const videoFilter = (_req, file, cb) => {
  const ok =
    /video\/(mp4|webm|quicktime|x-m4v)/i.test(file.mimetype) ||
    /\.(mp4|webm|mov|m4v)$/i.test(file.originalname);
  cb(ok ? null : new Error("Only video files (mp4, webm, mov) are allowed"), ok);
};

const RESOURCE_EXTENSIONS = /\.(pdf|zip|rar|7z|doc|docx|xls|xlsx|ppt|pptx|txt|csv|rtf)$/i;
const RESOURCE_MIMES =
  /^(application\/(pdf|zip|x-zip-compressed|vnd\.rar|x-7z-compressed|msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|vnd\.ms-(excel|powerpoint)|octet-stream)|text\/(plain|csv|rtf))$/i;

const resourceFilter = (_req, file, cb) => {
  const ok = RESOURCE_MIMES.test(file.mimetype) || RESOURCE_EXTENSIONS.test(file.originalname);
  cb(
    ok ? null : new Error("Only document files (pdf, zip, word, excel, ppt, txt, etc.) are allowed"),
    ok
  );
};

const createFilesFilter = (req, file, cb) => {
  if (file.fieldname === "thumbnail") return imageFilter(req, file, cb);
  if (file.fieldname === "video") return videoFilter(req, file, cb);
  if (file.fieldname === "resourceFiles") return resourceFilter(req, file, cb);
  cb(new Error(`Unexpected field: ${file.fieldname}`), false);
};

module.exports = {
  UPLOAD_ROOT,
  COURSE_THUMBNAILS,
  COURSE_VIDEOS,
  COURSE_RESOURCES,
  COURSE_TMP,
  INSTRUCTOR_PHOTOS,

  uploadCourseThumbnail: multer({
    storage: thumbnailStorage,
    limits: { fileSize: THUMBNAIL_MAX_BYTES },
    fileFilter: imageFilter,
  }).single("thumbnail"),

  uploadCourseVideo: multer({
    storage: videoStorage,
    limits: { fileSize: VIDEO_MAX_BYTES },
    fileFilter: videoFilter,
  }).single("video"),

  /** Create/update — files land in _tmp until DB save succeeds */
  uploadCourseCreateFiles: multer({
    storage: tempStorage,
    limits: { fileSize: VIDEO_MAX_BYTES },
    fileFilter: createFilesFilter,
  }).fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "resourceFiles", maxCount: 20 },
  ]),

  /** Lesson video — tmp until course.save() succeeds */
  uploadCourseLessonVideo: multer({
    storage: tempStorage,
    limits: { fileSize: VIDEO_MAX_BYTES },
    fileFilter: videoFilter,
  }).single("video"),

  uploadInstructorPhoto: multer({
    storage: instructorPhotoStorage,
    limits: { fileSize: THUMBNAIL_MAX_BYTES },
    fileFilter: imageFilter,
  }).single("photo"),

  THUMBNAIL_MAX_BYTES,
  VIDEO_MAX_BYTES,
  RESOURCE_MAX_BYTES,

  toPublicPath: (filename, type = "thumbnail") => {
    if (!filename) return "";
    if (String(filename).startsWith("/uploads/")) return filename;
    const folder =
      type === "video"
        ? "videos"
        : type === "resource"
          ? "resources"
          : type === "instructor"
            ? "photos"
            : "thumbnails";
    const base =
      type === "instructor" ? "/uploads/instructors" : "/uploads/courses";
    return `${base}/${folder}/${filename}`;
  },
};
