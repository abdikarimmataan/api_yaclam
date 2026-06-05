const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const pageCmsValidation = require("../validations/page_cms.val");
const scholarshipCmsController = require("../controllers/scholarship_cms");
const auth = require("../middlewares/auth");

router.get("/getAll", scholarshipCmsController.getAll);

router.use(auth.authorize());

router.post("/create", validate.validate(pageCmsValidation.createSchema), scholarshipCmsController.create);
router.patch("/update/:id", validate.validate(pageCmsValidation.updateSchema), scholarshipCmsController.update);

module.exports = router;
