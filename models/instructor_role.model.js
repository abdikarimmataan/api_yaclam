const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const instructorRoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

instructorRoleSchema.plugin(toJSON);
module.exports = mongoose.model("InstructorRole", instructorRoleSchema, "instructor_roles");
