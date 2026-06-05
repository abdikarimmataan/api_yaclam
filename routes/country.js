const router = require("express").Router();
const countryController = require("../controllers/country");

router.get("/getAll", countryController.getAll);

module.exports = router;
