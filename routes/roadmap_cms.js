const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const pageCmsValidation = require("../validations/page_cms.val");
const roadmapCmsController = require("../controllers/roadmap_cms");
const auth = require("../middlewares/auth");

router.get("/getAll", roadmapCmsController.getAll);

router.use(auth.authorize());

router.post("/create", validate.validate(pageCmsValidation.createSchema), roadmapCmsController.create);
router.patch("/update/:id", validate.validate(pageCmsValidation.updateSchema), roadmapCmsController.update);

module.exports = router;
