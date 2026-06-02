const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const whyYaclamValidation = require("../validations/why_yaclam.val");
const whyYaclamController = require("../controllers/why_yaclam");
const auth = require("../middlewares/auth");

router.get("/getAll", whyYaclamController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", whyYaclamController.getById);
router.post("/create", validate.validate(whyYaclamValidation.createSchema), whyYaclamController.create);
router.patch("/update/:id", validate.validate(whyYaclamValidation.updateSchema), whyYaclamController.update);
router.delete("/delete/:id", whyYaclamController.delete);

module.exports = router;
