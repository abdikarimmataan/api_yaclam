const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const blogCategoryValidation = require("../validations/blog_category.val");
const blogCategoryController = require("../controllers/blog_category");
const auth = require("../middlewares/auth");

router.get("/getAll", blogCategoryController.getAll);
router.get("/getById/:id", blogCategoryController.getById);

router.use(auth.authorize());

router.post("/create", validate.validate(blogCategoryValidation.createSchema), blogCategoryController.create);
router.patch("/update/:id", validate.validate(blogCategoryValidation.updateSchema), blogCategoryController.update);
router.patch(
  "/status/:id",
  validate.validate(blogCategoryValidation.updateStatusSchema),
  blogCategoryController.updateStatus
);
router.delete("/delete/:id", blogCategoryController.delete);

module.exports = router;
