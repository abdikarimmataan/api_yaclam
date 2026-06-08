const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const instructorValidation = require("../validations/instructor.val");
const instructorController = require("../controllers/instructor");
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

router.post("/login", validate.validate(instructorValidation.loginSchema), instructorController.login);
router.get("/getAll", instructorController.getAll);
router.get("/getById/:id", instructorController.getById);

router.use(auth.authorize());

router.post(
  "/upload/photo",
  wrapUpload(upload.uploadInstructorPhoto),
  instructorController.uploadPhoto
);
router.post("/create", validate.validate(instructorValidation.createSchema), instructorController.create);
router.patch("/update/:id", validate.validate(instructorValidation.updateSchema), instructorController.update);
router.delete("/delete/:id", instructorController.delete);

module.exports = router;
