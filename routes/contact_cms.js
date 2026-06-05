const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const pageCmsValidation = require("../validations/page_cms.val");
const contactCmsController = require("../controllers/contact_cms");
const auth = require("../middlewares/auth");

router.get("/getAll", contactCmsController.getAll);

router.use(auth.authorize());

router.post("/create", validate.validate(pageCmsValidation.createSchema), contactCmsController.create);
router.patch("/update/:id", validate.validate(pageCmsValidation.updateSchema), contactCmsController.update);

module.exports = router;
