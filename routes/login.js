const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const loginValidation = require("../validations/login.val");
const loginController = require("../controllers/login");
const auth = require("../middlewares/auth");

router.get("/getAll", loginController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", loginController.getById);
router.post("/create", validate.validate(loginValidation.createSchema), loginController.create);
router.patch("/update/:id", validate.validate(loginValidation.updateSchema), loginController.update);
router.delete("/delete/:id", loginController.delete);

module.exports = router;
