const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const roadmapValidation = require("../validations/roadmap.val");
const roadmapController = require("../controllers/roadmap");
const auth = require("../middlewares/auth");

router.get("/getAll", roadmapController.getAll);
router.get("/getBySlug/:slug", roadmapController.getBySlug);
router.get("/:slug", roadmapController.getBySlug);

router.use(auth.authorize());

router.get("/getById/:id", roadmapController.getById);
router.post("/create", validate.validate(roadmapValidation.createSchema), roadmapController.create);
router.patch("/update/:id", validate.validate(roadmapValidation.updateSchema), roadmapController.update);
router.patch("/status/:id", roadmapController.updateStatus);
router.delete("/delete/:id", roadmapController.delete);

module.exports = router;
