const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const pageCmsValidation = require("../validations/page_cms.val");
const courseCmsController = require("../controllers/course_cms");
const auth = require("../middlewares/auth");

router.get("/getAll", courseCmsController.getAll);

router.use(auth.authorize());

router.post("/create", validate.validate(pageCmsValidation.createSchema), courseCmsController.create);
router.patch("/update/:id", validate.validate(pageCmsValidation.updateSchema), courseCmsController.update);

module.exports = router;
