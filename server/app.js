require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const sessionRoutes = require("./routes/session");

const app = express();
app.set("etag", false);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log("Mongo error", err));

app.use(express.json());
const isProd = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

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

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/session", sessionRoutes);

const path = require("path");
const buildPath = path.join(__dirname, "..", "client", "dist");

app.use(express.static(buildPath));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
