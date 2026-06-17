const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const purchaseSchema = new mongoose.Schema(
  {
    studentID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    transactionID: { type: String, default: null },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

purchaseSchema.index({ studentID: 1, courseId: 1 }, { unique: true });
purchaseSchema.index({ studentID: 1, del_status: 1 });

purchaseSchema.plugin(toJSON);
module.exports = mongoose.model("Purchase", purchaseSchema, "purchases");
