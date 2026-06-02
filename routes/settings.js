const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const settingsValidation = require("../validations/settings.val");
const settingsController = require("../controllers/settings");
const auth = require("../middlewares/auth");

router.get("/", settingsController.get);

router.use(auth.authorize());

router.patch("/update/:id", validate.validate(settingsValidation.updateSchema), settingsController.update);

module.exports = router;
