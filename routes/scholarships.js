const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const scholarshipsValidation = require("../validations/scholarships.val");
const scholarshipsController = require("../controllers/scholarships");
const auth = require("../middlewares/auth");

router.get("/getAll", scholarshipsController.getAll);

router.use(auth.authorize());

router.get("/getById/:id", scholarshipsController.getById);
router.post("/create", validate.validate(scholarshipsValidation.createSchema), scholarshipsController.create);
router.patch("/update/:id", validate.validate(scholarshipsValidation.updateSchema), scholarshipsController.update);
router.delete("/delete/:id", scholarshipsController.delete);

module.exports = router;
