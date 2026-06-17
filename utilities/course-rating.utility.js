const Course = require("../models/course.model");
const CourseRating = require("../models/course_rating.model");

function normalizeRatingValue(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  if (numeric > 5) return Math.min(5, Math.round((numeric / 2) * 10) / 10);
  return Math.min(5, numeric);
}

async function syncCourseRating(courseId) {
  const ratings = await CourseRating.find({ courseId, del_status: "Live" }).select("rating");
  const count = ratings.length;
  const avg = count
    ? Math.round((ratings.reduce((sum, row) => sum + normalizeRatingValue(row.rating), 0) / count) * 10) / 10
    : 0;

  await Course.updateOne({ _id: courseId }, { rating: avg, reviewCount: count });
  return { avg, count };
}

module.exports = { syncCourseRating, normalizeRatingValue };
