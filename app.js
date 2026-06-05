const express = require("express");
const path = require("path");
const cors = require("cors");
const db = require("./config/db");
const apiRouter = require("./routes/index");

require("dotenv").config();

const PORT = process.env.PORT || 9000;
const app = express();

const allowedOrigins = [
  "https://yaclam.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Type", "application/json");
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
  next();
});

app.use(express.json());
app.use("/api", apiRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "yaclam-api" });
});

(async () => {
  try {
    await db.connectDB();
    app.listen(PORT, () => console.log(`Yaclam API running on port ${PORT}`));
  } catch (err) {
    console.error("Startup failed:", err.message);
    process.exit(1);
  }
})();
