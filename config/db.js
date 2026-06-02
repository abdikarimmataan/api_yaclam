const mongoose = require("mongoose");
require("dotenv").config();

mongoose.set("strictQuery", false);

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yaclam";

module.exports = {
  connectDB: async () => {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  },
};
