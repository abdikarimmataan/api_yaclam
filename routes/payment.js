const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const paymentValidation = require("../validations/payment.val");
const paymentController = require("../controllers/payment");
const auth = require("../middlewares/auth");

router.use(auth.authorize());

router.get("/methods", paymentController.getMethods);
router.post(
  "/pay",
  validate.validate(paymentValidation.paySchema),
  paymentController.pay
);
router.post(
  "/stripe/intent",
  validate.validate(paymentValidation.stripeIntentSchema),
  paymentController.createStripeIntent
);
router.post(
  "/stripe/checkout",
  validate.validate(paymentValidation.stripeCheckoutSchema),
  paymentController.createStripeCheckout
);
router.post(
  "/stripe/confirm",
  validate.validate(paymentValidation.stripeConfirmSchema),
  paymentController.confirmStripeCheckout
);
router.get("/my-transactions", paymentController.getMyTransactions);

module.exports = router;
