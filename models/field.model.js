const mongoose = require("mongoose");
const { toJSON } = require("../utilities/toJson.utility");

const fieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    del_status: { type: String, enum: ["Live", "Deleted"], default: "Live" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

fieldSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { del_status: "Live" } }
);

fieldSchema.plugin(toJSON);

const Field = mongoose.model("Field", fieldSchema, "fields");

async function syncFieldNameIndex() {
  if (mongoose.connection.readyState !== 1) return;

  const collection = mongoose.connection.collection("fields");
  try {
    const indexes = await collection.indexes();
    for (const index of indexes) {
      if (index.key?.name === 1 && !index.partialFilterExpression) {
        await collection.dropIndex(index.name);
      }
    }
  } catch (_) {
    // legacy index may already be removed
  }

  try {
    await Field.syncIndexes();
  } catch (_) {
    // index sync can fail if duplicates exist among Live records
  }
}

if (mongoose.connection.readyState === 1) {
  syncFieldNameIndex();
} else {
  mongoose.connection.once("connected", syncFieldNameIndex);
}

module.exports = Field;