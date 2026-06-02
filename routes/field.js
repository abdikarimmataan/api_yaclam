const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const fieldValidation = require("../validations/field.val");
const fieldController = require("../controllers/field");
const auth = require("../middlewares/auth");

router.get("/getAll", fieldController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", fieldController.getById);
router.post("/create", validate.validate(fieldValidation.createSchema), fieldController.create);
router.patch("/update/:id", validate.validate(fieldValidation.updateSchema), fieldController.update);
router.delete("/delete/:id", fieldController.delete);

module.exports = router;
