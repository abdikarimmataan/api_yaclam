const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const validation = require("../validations/university_manage.val");
const controller = require("../controllers/university_manage");
const auth = require("../middlewares/auth");

router.get("/getAll", controller.getAll);
router.get("/getById/:id", controller.getById);

router.use(auth.authorize());

router.post("/create", validate.validate(validation.createSchema), controller.create);
router.patch("/update/:id", validate.validate(validation.updateSchema), controller.update);
router.delete("/delete/:id", controller.delete);

module.exports = router;
