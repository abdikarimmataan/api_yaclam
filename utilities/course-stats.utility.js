const {
  parseDurationToSeconds,
  computeCurriculumStats,
} = require("./course-curriculum-stats.utility");

function stripManualCourseStats(body = {}) {
  ["rating", "reviewCount", "studentCount", "durationHours", "lessonCount"].forEach((key) => {
    delete body[key];
  });

  if (body.details && typeof body.details === "object") {
    delete body.details.durationHours;
    delete body.details.lessonCount;
  }

  return body;
}

function applyComputedStatsToPayload(body = {}) {
  stripManualCourseStats(body);

  if (!Array.isArray(body.curriculum)) return body;

  const stats = computeCurriculumStats(body.curriculum);
  body.lessonCount = stats.lessonCount;
  body.durationHours = stats.durationHours;

  if (!body.details || typeof body.details !== "object") {
    body.details = {};
  }
  body.details.lessonCount = stats.lessonCount;
  body.details.durationHours = stats.durationHours;

  if (stats.durationHours > 0) {
    body.duration = `${stats.durationHours} hours`;
  }

  return body;
}

async function syncCourseEnrollmentCount(courseId) {
  const Course = require("../models/course.model");
  const Purchase = require("../models/purchase.model");
  const count = await Purchase.countDocuments({ courseId, del_status: "Live" });
  await Course.updateOne({ _id: courseId }, { studentCount: count });
  return count;
}

async function getEnrollmentCount(courseId) {
  const Purchase = require("../models/purchase.model");
  return Purchase.countDocuments({ courseId, del_status: "Live" });
}

async function getEnrollmentCounts(courseIds) {
  if (!Array.isArray(courseIds) || courseIds.length === 0) return {};

  const mongoose = require("mongoose");
  const Purchase = require("../models/purchase.model");
  const objectIds = courseIds.map((id) => new mongoose.Types.ObjectId(id));

  const rows = await Purchase.aggregate([
    { $match: { courseId: { $in: objectIds }, del_status: "Live" } },
    { $group: { _id: "$courseId", count: { $sum: 1 } } },
  ]);

  const counts = {};
  courseIds.forEach((id) => {
    counts[String(id)] = 0;
  });
  rows.forEach((row) => {
    counts[String(row._id)] = row.count;
  });

  return counts;
}

module.exports = {
  parseDurationToSeconds,
  computeCurriculumStats,
  stripManualCourseStats,
  applyComputedStatsToPayload,
  syncCourseEnrollmentCount,
  getEnrollmentCount,
  getEnrollmentCounts,
};
