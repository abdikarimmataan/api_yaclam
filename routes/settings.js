const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const settingsValidation = require("../validations/settings.val");
const settingsController = require("../controllers/settings");
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

router.get("/", settingsController.get);

router.use(auth.authorize());

router.post(
  "/upload/logo",
  wrapUpload(upload.uploadSettingsLogo),
  settingsController.uploadLogo
);
router.post(
  "/upload/favicon",
  wrapUpload(upload.uploadSettingsFavicon),
  settingsController.uploadFavicon
);
router.post("/create", validate.validate(settingsValidation.createSchema), settingsController.create);
router.patch("/update/:id", validate.validate(settingsValidation.updateSchema), settingsController.update);

module.exports = router;
