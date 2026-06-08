const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const parseCourseBody = require("../middlewares/parseCourseBody.middleware");
const courseValidation = require("../validations/course.val");
const courseController = require("../controllers/course");
const courseInstructorController = require("../controllers/course_instructor");
const auth = require("../middlewares/auth");
const requireInstructor = require("../middlewares/requireInstructor");
const upload = require("../middlewares/upload.middleware");

function wrapUpload(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) return courseController.handleUploadError(err, res);
      next();
    });
  };
}

function optionalMultipart(multerMiddleware) {
  return (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) return next();
    return wrapUpload(multerMiddleware)(req, res, next);
  };
}

router.use(auth.authorize());
router.use(requireInstructor);

router.get("/getAll", courseInstructorController.getAll);
router.get("/getById/:id", courseInstructorController.getById);

router.post(
  "/upload/thumbnail",
  wrapUpload(upload.uploadCourseThumbnail),
  courseController.uploadThumbnail
);
router.post("/upload/video", wrapUpload(upload.uploadCourseVideo), courseController.uploadVideo);

router.post(
  "/create",
  optionalMultipart(upload.uploadCourseCreateFiles),
  parseCourseBody,
  courseInstructorController.injectInstructorBody,
  validate.validate(courseValidation.createSchema),
  courseController.create
);

router.patch(
  "/update/:id",
  courseInstructorController.assertOwnCourse,
  optionalMultipart(upload.uploadCourseCreateFiles),
  parseCourseBody,
  courseInstructorController.injectInstructorBody,
  validate.validate(courseValidation.updateSchema),
  courseController.update
);

router.post(
  "/:id/curriculum/lesson-video",
  courseInstructorController.assertOwnCourse,
  wrapUpload(upload.uploadCourseLessonVideo),
  parseCourseBody,
  validate.validate(courseValidation.uploadLessonVideoSchema),
  courseController.uploadLessonVideo
);

router.patch(
  "/status/:id",
  courseInstructorController.assertOwnCourse,
  courseController.updateStatus
);

router.delete(
  "/delete/:id",
  courseInstructorController.assertOwnCourse,
  courseController.delete
);

module.exports = router;
