const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const courseCommentValidation = require("../validations/course_comment.val");
const courseCommentController = require("../controllers/course_comment");
const auth = require("../middlewares/auth");

router.get(
  "/by-course/:courseId",
  validate.validate(courseCommentValidation.courseIdParamSchema, "params"),
  courseCommentController.getByCourse
);

router.use(auth.authorize());

router.post(
  "/",
  validate.validate(courseCommentValidation.createSchema),
  courseCommentController.create
);

router.post(
  "/:id/reply",
  validate.validate(courseCommentValidation.idParamSchema, "params"),
  validate.validate(courseCommentValidation.replySchema),
  courseCommentController.reply
);

module.exports = router;
