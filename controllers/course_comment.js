const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

const Course = require("../models/course.model");
const CourseComment = require("../models/course_comment.model");
const Purchase = require("../models/purchase.model");
const User = require("../models/user.model");
const Instructor = require("../models/instructor.model");
const Response = require("../utilities/reponse.utility.js");
const ResponseMessage = require("../utilities/message.utility.js");

async function resolveAuthor(req) {
  const { userId, accountType } = req.user;
  if (!userId || !isValidObjectId(userId)) return null;

  if (accountType === "student") {
    const user = await User.findOne({ _id: userId, del_status: "Live", accountType: "student" });
    if (!user) return null;
    return {
      userId,
      authorType: "student",
      authorName: user.profile?.full_name?.trim() || "Student",
      authorAvatar: user.profile?.avatar_url?.trim() || "",
    };
  }

  if (accountType === "admin") {
    const user = await User.findOne({ _id: userId, del_status: "Live", accountType: "admin" });
    if (!user) return null;
    return {
      userId,
      authorType: "admin",
      authorName: user.profile?.full_name?.trim() || "Admin",
      authorAvatar: user.profile?.avatar_url?.trim() || "",
    };
  }

  if (accountType === "instructor") {
    const instructor = await Instructor.findOne({ _id: userId, del_status: "Live" });
    if (!instructor) return null;
    return {
      userId,
      authorType: "instructor",
      authorName: instructor.name?.trim() || "Instructor",
      authorAvatar: instructor.photo?.trim() || "",
    };
  }

  return null;
}

async function studentEnrolled(studentId, courseId) {
  const purchase = await Purchase.findOne({
    studentID: studentId,
    courseId,
    del_status: "Live",
  });
  return Boolean(purchase);
}

async function instructorOwnsCourse(instructorId, courseId) {
  const oid = new mongoose.Types.ObjectId(instructorId);
  const course = await Course.findOne({
    _id: courseId,
    del_status: "Live",
    $or: [{ "instructor.instructorId": oid }, { instructorId: oid }],
  });
  return Boolean(course);
}

function buildCommentThreads(rows, lessonId) {
  const filtered = lessonId
    ? rows.filter((row) => !row.lessonId || row.lessonId === lessonId)
    : rows;

  const byId = new Map();
  const roots = [];

  for (const row of filtered) {
    const node = {
      id: row.id || String(row._id),
      courseId: String(row.courseId),
      lessonId: row.lessonId || "",
      userId: String(row.userId),
      authorType: row.authorType,
      authorName: row.authorName || "",
      authorAvatar: row.authorAvatar || "",
      text: row.text,
      parentId: row.parentId ? String(row.parentId) : null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      replies: [],
    };
    byId.set(node.id, node);
  }

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId).replies.push(node);
    } else if (!node.parentId) {
      roots.push(node);
    }
  }

  roots.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  for (const root of roots) {
    root.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  return roots;
}

module.exports = {
  getByCourse: async (req, res) => {
    try {
      const { courseId } = req.params;
      const lessonId = String(req.query.lessonId ?? "").trim();

      if (!isValidObjectId(courseId)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const course = await Course.findOne({ _id: courseId, del_status: "Live" });
      if (!course) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      const rows = await CourseComment.find({ courseId, del_status: "Live" })
        .sort({ created_at: 1 })
        .lean();

      const comments = buildCommentThreads(rows, lessonId);

      return Response.successResponse(res, 200, {
        courseId,
        lessonId: lessonId || null,
        total: comments.length,
        comments,
      });
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  create: async (req, res) => {
    try {
      if (req.user.accountType !== "student") {
        return Response.customResponse(res, 403, "Only students can post comments");
      }

      const author = await resolveAuthor(req);
      if (!author) {
        return Response.customResponse(res, 403, ResponseMessage.ACCESS_DENIED);
      }

      const { courseId, lessonId = "", text } = req.body;
      if (!isValidObjectId(courseId)) {
        return Response.errorResponse(res, 400, { message: "courseId must be a valid id" });
      }

      const course = await Course.findOne({ _id: courseId, del_status: "Live" });
      if (!course) {
        return Response.customResponse(res, 404, ResponseMessage.NOT_FOUND);
      }

      const enrolled = await studentEnrolled(author.userId, courseId);
      if (!enrolled) {
        return Response.customResponse(res, 403, "You must enroll in this course to comment");
      }

      const comment = await CourseComment.create({
        courseId,
        lessonId: String(lessonId ?? "").trim(),
        userId: author.userId,
        authorType: author.authorType,
        authorName: author.authorName,
        authorAvatar: author.authorAvatar,
        text: text.trim(),
        parentId: null,
      });

      return Response.successResponse(res, 201, comment);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },

  reply: async (req, res) => {
    try {
      const accountType = req.user.accountType;
      if (accountType !== "admin" && accountType !== "instructor") {
        return Response.customResponse(res, 403, "Only instructors or admins can reply");
      }

      const author = await resolveAuthor(req);
      if (!author) {
        return Response.customResponse(res, 403, ResponseMessage.ACCESS_DENIED);
      }

      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return Response.errorResponse(res, 400, { message: ResponseMessage.INVALID_ID });
      }

      const parent = await CourseComment.findOne({ _id: id, del_status: "Live", parentId: null });
      if (!parent) {
        return Response.customResponse(res, 404, "Comment not found");
      }

      if (accountType === "instructor") {
        const owns = await instructorOwnsCourse(author.userId, parent.courseId);
        if (!owns) {
          return Response.customResponse(res, 403, "You can only reply on your own courses");
        }
      }

      const reply = await CourseComment.create({
        courseId: parent.courseId,
        lessonId: parent.lessonId || "",
        userId: author.userId,
        authorType: author.authorType,
        authorName: author.authorName,
        authorAvatar: author.authorAvatar,
        text: req.body.text.trim(),
        parentId: parent._id,
      });

      return Response.successResponse(res, 201, reply);
    } catch (err) {
      return Response.errorResponse(res, 500, err.message || err);
    }
  },
};
