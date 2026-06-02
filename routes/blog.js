const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const blogValidation = require("../validations/blog.val");
const blogController = require("../controllers/blog");
const auth = require("../middlewares/auth");

router.get("/getAll", blogController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", blogController.getById);
router.post("/create", validate.validate(blogValidation.createSchema), blogController.create);
router.patch("/update/:id", validate.validate(blogValidation.updateSchema), blogController.update);
router.delete("/delete/:id", blogController.delete);

module.exports = router;
