const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const testimonialValidation = require("../validations/testimonial.val");
const testimonialController = require("../controllers/testimonial");
const auth = require("../middlewares/auth");

router.get("/getAll", testimonialController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", testimonialController.getById);
router.post("/create", validate.validate(testimonialValidation.createSchema), testimonialController.create);
router.patch("/update/:id", validate.validate(testimonialValidation.updateSchema), testimonialController.update);
router.delete("/delete/:id", testimonialController.delete);

module.exports = router;
