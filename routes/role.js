const router = require("express").Router();
const roleController = require("../controllers/role");
const auth = require("../middlewares/auth");

router.use(auth.authorize());
router.get("/getAll", roleController.getAll);
router.post("/create", roleController.create);
router.patch("/update/:id", roleController.update);
router.delete("/delete/:id", roleController.delete);

module.exports = router;
