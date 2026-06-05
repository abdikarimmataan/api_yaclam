const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const scholarshipCmsValidation = require("../validations/scholarship_cms.val");
const scholarshipCmsController = require("../controllers/scholarship_cms");
const auth = require("../middlewares/auth");

router.get("/getAll", scholarshipCmsController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", scholarshipCmsController.getById);
router.post("/create", validate.validate(scholarshipCmsValidation.createSchema), scholarshipCmsController.create);
router.patch("/update/:id", validate.validate(scholarshipCmsValidation.updateSchema), scholarshipCmsController.update);
router.delete("/delete/:id", scholarshipCmsController.delete);

module.exports = router;
