const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const homeSectionsValidation = require("../validations/home_sections.val");
const homeSectionsController = require("../controllers/home_sections");
const auth = require("../middlewares/auth");

router.get("/getAll", homeSectionsController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", homeSectionsController.getById);
router.post("/create", validate.validate(homeSectionsValidation.createSchema), homeSectionsController.create);
router.patch("/update/:id", validate.validate(homeSectionsValidation.updateSchema), homeSectionsController.update);
router.delete("/delete/:id", homeSectionsController.delete);

module.exports = router;
