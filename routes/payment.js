const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const paymentValidation = require("../validations/payment.val");
const paymentController = require("../controllers/payment");
const auth = require("../middlewares/auth");

router.use(auth.authorize());

router.post(
  "/pay",
  validate.validate(paymentValidation.paySchema),
  paymentController.pay
);
router.get("/my-transactions", paymentController.getMyTransactions);

module.exports = router;
