const router = require("express").Router();
const cartController = require("../controllers/cart");
const auth = require("../middlewares/auth");

router.use(auth.authorize());
router.get("/", cartController.getCart);
router.post("/items", cartController.addItem);
router.delete("/items/:courseId", cartController.removeItem);
router.delete("/clear", cartController.clearCart);

module.exports = router;
