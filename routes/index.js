const router = require("express").Router();
const validate = require("../middlewares/validationMiddleware");
const userVal = require("../validations/user.val");
const userController = require("../controllers/user");

router.post(
  "/users/admin/bootstrap",
  validate.validate(userVal.bootstrapAdminSchema),
  userController.bootstrapAdmin
);

router.use("/users", require("./user"));
router.use("/settings", require("./settings"));
router.use("/footer", require("./footer"));
router.use("/pages", require("./pages"));
router.use("/home", require("./home"));
router.use("/course", require("./course"));
router.use("/course_category", require("./course_category"));
router.use("/course_categories", require("./course_category"));
router.use("/course-comment", require("./course_comment"));
router.use("/course_comments", require("./course_comment"));
router.use("/course-rating", require("./course_rating"));
router.use("/course_ratings", require("./course_rating"));
router.use("/courses", require("./courses"));
router.use("/course_cms", require("./course_cms"));
router.use("/field", require("./field"));
router.use("/fields", require("./field"));
router.use("/icon", require("./icon"));
router.use("/icons", require("./icon"));
router.use("/country", require("./country"));
router.use("/countries", require("./country"));
router.use("/home_sections", require("./home_sections"));
router.use("/why_yaclam", require("./why_yaclam"));
router.use("/practitioner", require("./practitioner"));
router.use("/practitioners", require("./practitioner"));
router.use("/testimonial", require("./testimonial"));
router.use("/testimonials", require("./testimonial"));
router.use("/roadmap", require("./roadmap"));
router.use("/roadmaps", require("./roadmap"));
router.use("/roadmap_cms", require("./roadmap_cms"));
router.use("/scholarship", require("./scholarship"));
router.use("/scholarships", require("./scholarship"));
router.use("/scholarship_cms", require("./scholarship_cms"));
router.use("/university_category", require("./university_category"));
router.use("/university_categories", require("./university_category"));
router.use("/university_program", require("./university_program"));
router.use("/university_programs", require("./university_program"));
router.use("/university_discipline", require("./university_discipline"));
router.use("/university_disciplines", require("./university_discipline"));
router.use("/university_language", require("./university_language"));
router.use("/university_languages", require("./university_language"));
router.use("/university_location", require("./university_location"));
router.use("/university_locations", require("./university_location"));
router.use("/university", require("./university"));
router.use("/universities", require("./university"));
router.use("/university_manage", require("./university_manage"));
router.use("/university_manages", require("./university_manage"));
router.use("/university_sync", require("./university_sync"));
router.use("/university_cms", require("./university_cms"));
router.use("/blog_cms", require("./blog_cms"));
router.use("/about_cms", require("./about_cms"));
router.use("/contact_cms", require("./contact_cms"));
router.use("/blog_category", require("./blog_category"));
router.use("/blog_categories", require("./blog_category"));
router.use("/blog_post", require("./blog_post"));
router.use("/blog_posts", require("./blog_post"));
router.use("/cart", require("./cart"));
router.use("/purchase", require("./purchase"));
router.use("/purchases", require("./purchase"));
router.use("/payment", require("./payment"));
router.use("/wishlist", require("./wishlist"));
router.use("/newsletter", require("./newsletter"));
router.use("/role", require("./role"));
router.use("/instructor_role", require("./instructor_role"));
router.use("/instructor_roles", require("./instructor_role"));
router.use("/instructor", require("./instructor"));
router.use("/instructors", require("./instructor"));

module.exports = router;
