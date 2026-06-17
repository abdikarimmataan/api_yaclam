/**
 * Converts course price fields from BSON Int32 to Double so decimals (e.g. 0.10) can be stored.
 * Run once: node scripts/migrate-course-prices-to-double.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yaclam";

async function run() {
  await mongoose.connect(MONGO_URI);
  const col = mongoose.connection.collection("courses");
  const result = await col.updateMany(
    {},
    [
      {
        $set: {
          price: { $toDouble: { $ifNull: ["$price", 0] } },
          originalPrice: { $toDouble: { $ifNull: ["$originalPrice", 0] } },
        },
      },
    ]
  );
  console.log(`Updated ${result.modifiedCount} course(s).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
