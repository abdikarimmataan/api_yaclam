const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, trim: true },
    transactionLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransactionLog",
      required: true,
      unique: true,
    },
    amount: { type: Number, required: true, min: 0 },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseInfo: { type: Object, required: true },
    date: { type: Date, default: Date.now },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

transactionSchema.index({ studentId: 1, del_status: 1 });
transactionSchema.plugin(toJSON);
module.exports = mongoose.model("Transaction", transactionSchema, "transactions");
