const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const aboutValidation = require("../validations/about.val");
const aboutController = require("../controllers/about");
const auth = require("../middlewares/auth");

router.get("/getAll", aboutController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", aboutController.getById);
router.post("/create", validate.validate(aboutValidation.createSchema), aboutController.create);
router.patch("/update/:id", validate.validate(aboutValidation.updateSchema), aboutController.update);
router.delete("/delete/:id", aboutController.delete);

module.exports = router;
