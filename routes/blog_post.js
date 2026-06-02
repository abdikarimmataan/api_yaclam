const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const blogPostValidation = require("../validations/blog_post.val");
const blogPostController = require("../controllers/blog_post");
const auth = require("../middlewares/auth");

router.get("/getAll", blogPostController.getAll);
router.get("/getBySlug/:slug", blogPostController.getBySlug);
router.get("/:slug", blogPostController.getBySlug);

router.use(auth.authorize());

router.get("/getById/:id", blogPostController.getById);
router.post("/create", validate.validate(blogPostValidation.createSchema), blogPostController.create);
router.patch("/update/:id", validate.validate(blogPostValidation.updateSchema), blogPostController.update);
router.patch("/status/:id", blogPostController.updateStatus);
router.delete("/delete/:id", blogPostController.delete);

module.exports = router;
