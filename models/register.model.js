const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");
const { buttonSchema, linkSchema } = require("./schemas/button.schema");

const registerSchema = new mongoose.Schema(
  {
    headerText: { type: String, default: "Get Started" },
    title: { type: String, default: "Create your account" },
    subtitle: { type: String, default: "Join thousands of Somali learners on Yaclam" },
    submitButton: { type: buttonSchema, default: () => ({ label: "Register", isVisible: true }) },
    loginLink: { type: linkSchema, default: () => ({ label: "Already have an account? Log in", url: "/login", isVisible: true }) },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

registerSchema.plugin(toJSON);
module.exports = mongoose.model("Register", registerSchema);
