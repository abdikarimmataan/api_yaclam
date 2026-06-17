const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const wishlistValidation = require("../validations/wishlist.val");
const wishlistController = require("../controllers/wishlist");
const auth = require("../middlewares/auth");

router.use(auth.authorize());

router.get("/", wishlistController.getWishlist);
router.get("/check/:courseId", wishlistController.checkItem);
router.post(
  "/items",
  validate.validate(wishlistValidation.addItemSchema),
  wishlistController.addItem
);
router.delete("/items/:courseId", wishlistController.removeItem);

module.exports = router;
