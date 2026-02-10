const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

console.log("User model:", typeof User, User.modelName);

// SIGNUP
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash });

  req.session.userId = user._id;
  res
    .status(201)
    .json({ message: "Signed up", user: { id: user._id, email: user.email } });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  req.session.userId = user._id;
  res.json({ message: "Logged in", user: { id: user._id, email: user.email } });
});

// LOGOUT
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

// ME
router.get("/me", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ user: null });

  const user = await User.findById(req.session.userId).select("email");
  if (!user) return res.status(401).json({ user: null });

  res.json({ user: { id: user._id, email: user.email } });
});

module.exports = router;
