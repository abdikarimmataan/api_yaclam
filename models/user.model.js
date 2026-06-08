const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const profileSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    avatar_url: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    refresh_token: { type: String, default: null },
    last_access_token: { type: String, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: "" },
    accountType: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: Boolean, default: true },
    approve: { type: Boolean, default: true },
    profile: { type: profileSchema, required: true },
    session: { type: sessionSchema, default: () => ({}) },
    last_login: { type: Date },
    failed_logins: { type: Number, default: 0 },
    password_reset_token: { type: String, select: false, default: null },
    password_reset_expires: { type: Date, select: false, default: null },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

userSchema.index({ accountType: 1, del_status: 1 });

userSchema.plugin(toJSON);
module.exports = mongoose.model("User", userSchema);
