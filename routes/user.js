const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const userVal = require("../validations/user.val");
const userController = require("../controllers/user");
const auth = require("../middlewares/auth");

router.post("/register", validate.validate(userVal.registerSchema), userController.register);
router.post("/login", validate.validate(userVal.loginSchema), userController.login);
router.post("/admin/login", validate.validate(userVal.loginSchema), userController.loginAdmin);

router.use(auth.authorize());

router.post("/admin/create", validate.validate(userVal.createAdminSchema), userController.createAdmin);
router.get("/profile", userController.getProfile);
router.get("/getall/adminUsers", userController.getAdminUsers);
router.get("/getall/students", userController.getStudents);
router.get("/getById/:id", userController.getById);
router.patch("/admin/update/:id", validate.validate(userVal.updateAdminSchema), userController.updateAdmin);
router.patch("/status/:id", userController.updateStatus);
router.delete("/soft-delete/:id", userController.softDelete);

module.exports = router;
