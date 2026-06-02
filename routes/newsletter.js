const router = require("express").Router();
const newsletterController = require("../controllers/newsletter");
const auth = require("../middlewares/auth");

router.post("/subscribe", newsletterController.subscribe);

router.use(auth.authorize());
router.get("/getAll", newsletterController.getAll);

module.exports = router;
