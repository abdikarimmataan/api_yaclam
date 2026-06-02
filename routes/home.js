const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const homeValidation = require("../validations/home.val");
const homeController = require("../controllers/home");
const auth = require("../middlewares/auth");

router.get("/getAll", homeController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", homeController.getById);
router.post("/create", validate.validate(homeValidation.createSchema), homeController.create);
router.patch("/update/:id", validate.validate(homeValidation.updateSchema), homeController.update);
router.delete("/delete/:id", homeController.delete);

module.exports = router;
