const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const contactValidation = require("../validations/contact.val");
const contactController = require("../controllers/contact");
const auth = require("../middlewares/auth");

router.get("/getAll", contactController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", contactController.getById);
router.post("/create", validate.validate(contactValidation.createSchema), contactController.create);
router.patch("/update/:id", validate.validate(contactValidation.updateSchema), contactController.update);
router.delete("/delete/:id", contactController.delete);

module.exports = router;
