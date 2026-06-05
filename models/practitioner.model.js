const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");
const { deriveInitials } = require("../utilities/practitioner.utility");

const practitionerSchema = new mongoose.Schema(
  {
    initials: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "" },
    bio: { type: String, default: "" },
    coursesCount: { type: Number, default: 0 },
    studentsCount: { type: String, default: "" },
    color: { type: String, default: "#1D4ED8" },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

practitionerSchema.virtual("courses").get(function coursesAlias() {
  return this.coursesCount;
});

practitionerSchema.virtual("students").get(function studentsAlias() {
  return this.studentsCount;
});

practitionerSchema.pre("save", function syncPractitionerFields(next) {
  if (!this.initials && this.name) {
    this.initials = deriveInitials(this.name);
  }
  next();
});

practitionerSchema.plugin(toJSON);
module.exports = mongoose.model("Practitioner", practitionerSchema, "practitioners");
