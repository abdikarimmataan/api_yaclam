const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const roadmapsValidation = require("../validations/roadmaps.val");
const roadmapsController = require("../controllers/roadmaps");
const auth = require("../middlewares/auth");

router.get("/getAll", roadmapsController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", roadmapsController.getById);
router.post("/create", validate.validate(roadmapsValidation.createSchema), roadmapsController.create);
router.patch("/update/:id", validate.validate(roadmapsValidation.updateSchema), roadmapsController.update);
router.delete("/delete/:id", roadmapsController.delete);

module.exports = router;
