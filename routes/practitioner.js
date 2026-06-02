const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const practitionerValidation = require("../validations/practitioner.val");
const practitionerController = require("../controllers/practitioner");
const auth = require("../middlewares/auth");

router.get("/getAll", practitionerController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", practitionerController.getById);
router.post("/create", validate.validate(practitionerValidation.createSchema), practitionerController.create);
router.patch("/update/:id", validate.validate(practitionerValidation.updateSchema), practitionerController.update);
router.delete("/delete/:id", practitionerController.delete);

module.exports = router;
