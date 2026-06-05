const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const roadmapValidation = require("../validations/roadmap.val");
const roadmapController = require("../controllers/roadmap");
const auth = require("../middlewares/auth");

router.get("/getAll", roadmapController.getAll);
router.get("/getById/:id", roadmapController.getById);

router.use(auth.authorize());

router.post("/create", validate.validate(roadmapValidation.createSchema), roadmapController.create);
router.patch("/update/:id", validate.validate(roadmapValidation.updateSchema), roadmapController.update);
router.patch("/status/:id", validate.validate(roadmapValidation.updateStatusSchema), roadmapController.updateStatus);
router.delete("/delete/:id", roadmapController.delete);

module.exports = router;
