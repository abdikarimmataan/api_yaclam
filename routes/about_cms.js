const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const pageCmsValidation = require("../validations/page_cms.val");
const aboutCmsController = require("../controllers/about_cms");
const auth = require("../middlewares/auth");

router.get("/getAll", aboutCmsController.getAll);

router.use(auth.authorize());

router.post("/create", validate.validate(pageCmsValidation.createSchema), aboutCmsController.create);
router.patch("/update/:id", validate.validate(pageCmsValidation.updateSchema), aboutCmsController.update);

module.exports = router;
