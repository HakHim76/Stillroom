require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const sessionRoutes = require("./routes/session");

const app = express();

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

app.set("etag", false);

app.set("trust proxy", 1);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log("Mongo error", err));

app.use(express.json());

// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:4173",
//   "http://localhost:3000",
//   process.env.CLIENT_ORIGIN,
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: function (origin, cb) {
//       if (!origin) return cb(null, true);
//       if (allowedOrigins.includes(origin)) return cb(null, true);
//       return cb(new Error(`CORS blocked for origin: ${origin}`));
//     },
//     credentials: true,
//   }),
// );

app.use(
  session({
    secret: process.env.SESSION_SECRET || "stillroom_dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/session", sessionRoutes);

const clientDistPath = path.join(__dirname, "..", "client", "dist");

app.use(express.static(clientDistPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
