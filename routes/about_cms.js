const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const aboutCmsValidation = require("../validations/about_cms.val");
const aboutCmsController = require("../controllers/about_cms");
const auth = require("../middlewares/auth");

router.get("/getAll", aboutCmsController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", aboutCmsController.getById);
router.post("/create", validate.validate(aboutCmsValidation.createSchema), aboutCmsController.create);
router.patch("/update/:id", validate.validate(aboutCmsValidation.updateSchema), aboutCmsController.update);
router.delete("/delete/:id", aboutCmsController.delete);

module.exports = router;
