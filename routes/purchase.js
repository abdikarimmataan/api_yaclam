const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const purchaseValidation = require("../validations/purchase.val");
const purchaseController = require("../controllers/purchase");
const auth = require("../middlewares/auth");

router.get(
  "/enrollment-count/:courseId",
  purchaseController.getEnrollmentCount
);
router.get("/enrollment-counts", purchaseController.getEnrollmentCounts);

router.get(
  "/getstudentIDbyCourses/:studentId",
  purchaseController.getstudentIDbyCourses
);

router.use(auth.authorize());

router.get("/my-courses", purchaseController.getMyCourses);
router.post(
  "/enroll-free",
  validate.validate(purchaseValidation.enrollFreeSchema),
  purchaseController.enrollFree
);
router.post(
  "/create",
  validate.validate(purchaseValidation.createSchema),
  purchaseController.create
);
router.get("/getAll", purchaseController.getAll);

module.exports = router;
