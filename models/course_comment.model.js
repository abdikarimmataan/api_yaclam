const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const courseCommentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    lessonId: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    authorType: {
      type: String,
      enum: ["student", "instructor", "admin"],
      required: true,
    },
    authorName: { type: String, default: "" },
    authorAvatar: { type: String, default: "" },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseComment",
      default: null,
      index: true,
    },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

courseCommentSchema.index({ courseId: 1, lessonId: 1, parentId: 1 });

courseCommentSchema.plugin(toJSON);
module.exports = mongoose.model("CourseComment", courseCommentSchema, "course_comments");
