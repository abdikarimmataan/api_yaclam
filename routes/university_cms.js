const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const pageCmsValidation = require("../validations/page_cms.val");
const controller = require("../controllers/university_cms");
const auth = require("../middlewares/auth");

router.get("/getAll", controller.getAll);

router.use(auth.authorize());

router.post("/create", validate.validate(pageCmsValidation.createSchema), controller.create);
router.patch("/update/:id", validate.validate(pageCmsValidation.updateSchema), controller.update);

module.exports = router;
