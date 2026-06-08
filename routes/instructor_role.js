const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const instructorRoleValidation = require("../validations/instructor_role.val");
const instructorRoleController = require("../controllers/instructor_role");
const auth = require("../middlewares/auth");

router.get("/getAll", instructorRoleController.getAll);
router.get("/getById/:id", instructorRoleController.getById);

router.use(auth.authorize());

router.post(
  "/create",
  validate.validate(instructorRoleValidation.createSchema),
  instructorRoleController.create
);
router.patch(
  "/update/:id",
  validate.validate(instructorRoleValidation.updateSchema),
  instructorRoleController.update
);
router.delete("/delete/:id", instructorRoleController.delete);

module.exports = router;
