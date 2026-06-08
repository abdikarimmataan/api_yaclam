const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const contactCmsValidation = require("../validations/contact_cms.val");
const contactCmsController = require("../controllers/contact_cms");
const auth = require("../middlewares/auth");

router.get("/getAll", contactCmsController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", contactCmsController.getById);
router.post("/create", validate.validate(contactCmsValidation.createSchema), contactCmsController.create);
router.patch("/update/:id", validate.validate(contactCmsValidation.updateSchema), contactCmsController.update);
router.delete("/delete/:id", contactCmsController.delete);

module.exports = router;
