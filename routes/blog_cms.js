const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const pageCmsValidation = require("../validations/page_cms.val");
const blogCmsController = require("../controllers/blog_cms");
const auth = require("../middlewares/auth");

router.get("/getAll", blogCmsController.getAll);

router.use(auth.authorize());

router.post("/create", validate.validate(pageCmsValidation.createSchema), blogCmsController.create);
router.patch("/update/:id", validate.validate(pageCmsValidation.updateSchema), blogCmsController.update);

module.exports = router;
