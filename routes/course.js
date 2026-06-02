const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const courseValidation = require("../validations/course.val");
const courseController = require("../controllers/course");
const auth = require("../middlewares/auth");

router.get("/getAll", courseController.getAll);
router.get("/getBySlug/:slug", courseController.getBySlug);
router.get("/:slug", courseController.getBySlug);

router.use(auth.authorize());

router.get("/getById/:id", courseController.getById);
router.post("/create", validate.validate(courseValidation.createSchema), courseController.create);
router.patch("/update/:id", validate.validate(courseValidation.updateSchema), courseController.update);
router.patch("/status/:id", courseController.updateStatus);
router.delete("/delete/:id", courseController.delete);

module.exports = router;
