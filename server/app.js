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
app.set("trust proxy", 1);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log("Mongo error", err));

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "stillroom_dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  }),
);

app.use((req, res, next) => {
  console.log("INCOMING:", req.method, req.url);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/session", sessionRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
