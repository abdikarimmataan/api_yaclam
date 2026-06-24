const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const blogPostValidation = require("../validations/blog_post.val");
const blogPostController = require("../controllers/blog_post");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload.middleware");

function wrapUpload(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        if (err?.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File is too large." });
        }
        return res.status(400).json({ message: err.message || "Upload failed" });
      }
      next();
    });
  };
}

router.get("/getAll", blogPostController.getAll);
router.get("/getById/:id", blogPostController.getById);

router.use(auth.authorize());

router.post(
  "/upload/cover",
  wrapUpload(upload.uploadBlogCoverImage),
  blogPostController.uploadCoverImage
);
router.post("/create", validate.validate(blogPostValidation.createSchema), blogPostController.create);
router.patch("/update/:id", validate.validate(blogPostValidation.updateSchema), blogPostController.update);
router.patch("/status/:id", validate.validate(blogPostValidation.updateStatusSchema), blogPostController.updateStatus);
router.delete("/delete/:id", blogPostController.delete);

module.exports = router;
