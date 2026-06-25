const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const universityProgramSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    disciplineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UniversityDiscipline",
      default: null,
    },
    created_by: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

universityProgramSchema.index(
  { name: 1, disciplineId: 1 },
  { unique: true, partialFilterExpression: { del_status: "Live" } }
);

universityProgramSchema.plugin(toJSON);
module.exports = mongoose.model(
  "UniversityProgram",
  universityProgramSchema,
  "university_programs"
);
