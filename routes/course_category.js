const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const courseCategoryValidation = require("../validations/course_category.val");
const courseCategoryController = require("../controllers/course_category");
const auth = require("../middlewares/auth");

router.get("/getAll", courseCategoryController.getAll);
router.get("/getById/:id", courseCategoryController.getById);

router.use(auth.authorize());

router.post("/create", validate.validate(courseCategoryValidation.createSchema), courseCategoryController.create);
router.patch("/update/:id", validate.validate(courseCategoryValidation.updateSchema), courseCategoryController.update);
router.patch(
  "/status/:id",
  validate.validate(courseCategoryValidation.updateStatusSchema),
  courseCategoryController.updateStatus
);
router.delete("/delete/:id", courseCategoryController.delete);

module.exports = router;
