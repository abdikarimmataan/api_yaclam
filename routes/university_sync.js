const router = require("express").Router();
const controller = require("../controllers/university_sync");

router.get("/version", controller.getVersion);

module.exports = router;
