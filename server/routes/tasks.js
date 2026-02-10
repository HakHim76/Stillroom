const express = require("express");
const Task = require("../models/Task");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

// GET all tasks for logged-in user
router.get("/", requireLogin, async (req, res) => {
  const tasks = await Task.find({ userId: req.session.userId }).sort({
    createdAt: -1,
  });
  res.json({ tasks });
});

// CREATE a task
router.post("/", requireLogin, async (req, res) => {
  const { title, isPriority = false, dueDate = null } = req.body;
  if (!title || !title.trim())
    return res.status(400).json({ message: "Title required" });

  const task = await Task.create({
    userId: req.session.userId,
    title: title.trim(),
    isPriority: Boolean(isPriority),
    dueDate,
  });

  res.status(201).json({ task });
});

// UPDATE a task (toggle complete / priority / title / dueDate)
router.patch("/:id", requireLogin, async (req, res) => {
  const { id } = req.params;

  // Only allow safe fields
  const allowed = ["title", "completed", "isPriority", "dueDate"];
  const updates = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }
  if ("title" in updates && typeof updates.title === "string")
    updates.title = updates.title.trim();

  const task = await Task.findOneAndUpdate(
    { _id: id, userId: req.session.userId }, // critical: ownership check
    updates,
    { new: true },
  );

  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ task });
});

// DELETE a task
router.delete("/:id", requireLogin, async (req, res) => {
  const { id } = req.params;

  const deleted = await Task.findOneAndDelete({
    _id: id,
    userId: req.session.userId,
  });
  if (!deleted) return res.status(404).json({ message: "Task not found" });

  res.json({ message: "Deleted" });
});

module.exports = router;
