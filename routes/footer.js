const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const footerValidation = require("../validations/footer.val");
const footerController = require("../controllers/footer");
const auth = require("../middlewares/auth");

router.get("/getAll", footerController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", footerController.getById);
router.post("/create", validate.validate(footerValidation.createSchema), footerController.create);
router.patch("/update/:id", validate.validate(footerValidation.updateSchema), footerController.update);

module.exports = router;
