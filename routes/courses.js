const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const coursesValidation = require("../validations/courses.val");
const coursesController = require("../controllers/courses");
const auth = require("../middlewares/auth");

router.get("/getAll", coursesController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", coursesController.getById);
router.post("/create", validate.validate(coursesValidation.createSchema), coursesController.create);
router.patch("/update/:id", validate.validate(coursesValidation.updateSchema), coursesController.update);
router.delete("/delete/:id", coursesController.delete);

module.exports = router;
