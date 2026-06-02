const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const pagesValidation = require("../validations/pages.val");
const pagesController = require("../controllers/pages");
const auth = require("../middlewares/auth");

const bindKey = (pageKey) => (req, _res, next) => {
  req.params.pageKey = pageKey;
  next();
};

router.get("/home", bindKey("home"), pagesController.getByKey);
router.get("/about", bindKey("about"), pagesController.getByKey);
router.get("/contact", bindKey("contact"), pagesController.getByKey);

router.use(auth.authorize());

router.patch("/home", bindKey("home"), validate.validate(pagesValidation.updateSchema), pagesController.updateByKey);
router.patch("/about", bindKey("about"), validate.validate(pagesValidation.updateSchema), pagesController.updateByKey);
router.patch("/contact", bindKey("contact"), validate.validate(pagesValidation.updateSchema), pagesController.updateByKey);

module.exports = router;
