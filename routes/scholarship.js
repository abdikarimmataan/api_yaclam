const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const scholarshipValidation = require("../validations/scholarship.val");
const scholarshipController = require("../controllers/scholarship");
const auth = require("../middlewares/auth");

router.get("/getAll", scholarshipController.getAll);
router.get("/getBySlug/:slug", scholarshipController.getBySlug);
router.get("/:slug", scholarshipController.getBySlug);

router.use(auth.authorize());

router.get("/getById/:id", scholarshipController.getById);
router.post("/create", validate.validate(scholarshipValidation.createSchema), scholarshipController.create);
router.patch("/update/:id", validate.validate(scholarshipValidation.updateSchema), scholarshipController.update);
router.patch("/status/:id", scholarshipController.updateStatus);
router.delete("/delete/:id", scholarshipController.delete);

module.exports = router;
