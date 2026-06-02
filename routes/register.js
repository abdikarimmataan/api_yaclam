const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const registerValidation = require("../validations/register.val");
const registerController = require("../controllers/register");
const auth = require("../middlewares/auth");

router.get("/getAll", registerController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", registerController.getById);
router.post("/create", validate.validate(registerValidation.createSchema), registerController.create);
router.patch("/update/:id", validate.validate(registerValidation.updateSchema), registerController.update);
router.delete("/delete/:id", registerController.delete);

module.exports = router;
