const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const transactionLogSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, trim: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["success", "error"], required: true },
    responseCode: { type: String },
    state: { type: String },
    transactionId: { type: String },
    referenceId: { type: String },
    invoiceId: { type: String },
    amount: { type: Number },
    rawResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

transactionLogSchema.plugin(toJSON);
module.exports = mongoose.model("TransactionLog", transactionLogSchema, "transaction_logs");
