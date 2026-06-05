const router = require("express").Router();
const iconController = require("../controllers/icon");

router.get("/getAll", iconController.getAll);

module.exports = router;
