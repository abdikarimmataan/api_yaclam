const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const courseRatingValidation = require("../validations/course_rating.val");
const courseRatingController = require("../controllers/course_rating");
const auth = require("../middlewares/auth");

router.get(
  "/by-course/:courseId",
  validate.validate(courseRatingValidation.courseIdParamSchema, "params"),
  courseRatingController.getByCourse
);
router.get(
  "/by-courses",
  validate.validate(courseRatingValidation.courseIdsQuerySchema, "query"),
  courseRatingController.getByCourses
);

router.use(auth.authorize());

router.get(
  "/mine/:courseId",
  validate.validate(courseRatingValidation.courseIdParamSchema, "params"),
  courseRatingController.getMine
);

router.post(
  "/",
  validate.validate(courseRatingValidation.createSchema),
  courseRatingController.create
);

module.exports = router;
