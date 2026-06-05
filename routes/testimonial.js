const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const testimonialValidation = require("../validations/testimonial.val");
const testimonialController = require("../controllers/testimonial");
const auth = require("../middlewares/auth");

router.get("/getAll", testimonialController.getAll);
router.get("/getById/:id", testimonialController.getById);

router.use(auth.authorize());

router.post("/create", validate.validate(testimonialValidation.createSchema), testimonialController.create);
router.patch("/update/:id", validate.validate(testimonialValidation.updateSchema), testimonialController.update);
router.patch(
  "/status/:id",
  validate.validate(testimonialValidation.updateStatusSchema),
  testimonialController.updateStatus
);
router.delete("/delete/:id", testimonialController.delete);

module.exports = router;
