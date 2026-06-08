const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const sessionSchema = new mongoose.Schema(
  {
    refresh_token: { type: String, default: null },
    last_access_token: { type: String, default: null },
  },
  { _id: false }
);

const instructorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    photo: { type: String, default: "" },
    bio: { type: String, default: "" },
    instructorRoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstructorRole",
      default: null,
    },
    password: { type: String, required: true, select: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    session: { type: sessionSchema, default: () => ({}) },
    last_login: { type: Date },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

instructorSchema.plugin(toJSON);
module.exports = mongoose.model("Instructor", instructorSchema, "instructors");
