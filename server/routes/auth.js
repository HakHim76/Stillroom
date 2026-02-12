const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cleanUsername = String(username).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    if (!cleanUsername) {
      return res.status(400).json({ message: "Username required" });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
    });

    req.session.userId = user._id;

    res.status(201).json({
      message: "Signed up",
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Could not sign up" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    console.log("USER FOUND?", !!user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.userId = user._id;

    req.session.save(() => {
      res.json({
        message: "Logged in",
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      });
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Could not log in" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

router.get("/me", async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    if (!req.session.userId) return res.status(401).json({ user: null });

    const user = await User.findById(req.session.userId).select(
      "email username",
    );
    if (!user) return res.status(401).json({ user: null });

    res.json({
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    res.status(500).json({ user: null });
  }
});

module.exports = router;
