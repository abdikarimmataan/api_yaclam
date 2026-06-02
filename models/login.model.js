const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");
const { buttonSchema, linkSchema } = require("./schemas/button.schema");

const loginSchema = new mongoose.Schema(
  {
    headerText: { type: String, default: "Welcome back" },
    title: { type: String, default: "Log in to Yaclam" },
    subtitle: { type: String, default: "Continue your learning journey" },
    submitButton: { type: buttonSchema, default: () => ({ label: "Log in", isVisible: true }) },
    registerLink: { type: linkSchema, default: () => ({ label: "Don't have an account? Get Started", url: "/register", isVisible: true }) },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

loginSchema.plugin(toJSON);
module.exports = mongoose.model("Login", loginSchema);
