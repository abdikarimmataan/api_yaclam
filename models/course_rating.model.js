const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const courseRatingSchema = new mongoose.Schema(
  {
    studentID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: "", trim: true, maxlength: 2000 },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

courseRatingSchema.index({ studentID: 1, courseId: 1 }, { unique: true });
courseRatingSchema.index({ courseId: 1, del_status: 1 });

courseRatingSchema.plugin(toJSON);
module.exports = mongoose.model("CourseRating", courseRatingSchema, "course_ratings");
