const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const Task = require("../models/Task");

router.post("/start", async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      console.warn("NO USER SESSION");
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { taskId, tasks } = req.body;

    let taskIds = [];

    if (taskId) taskIds = [taskId];
    else if (Array.isArray(tasks)) taskIds = tasks;

    if (taskIds.length === 0) {
      return res.status(400).json({ error: "Provide taskId or tasks[]" });
    }

    const session = await Session.create({
      userId: req.session.userId,
      tasks: taskIds,
      startedAt: new Date(),
    });

    console.log("FOCUS SESSION STARTED:", session._id);

    res.json({ sessionId: session._id });
  } catch (err) {
    console.error("START SESSION ERROR:", err);
    res.status(500).json({ error: "Could not start focus session" });
  }
});

router.post("/end", async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { sessionId, mood, reflection } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId required" });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (String(session.userId) !== String(req.session.userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    session.endedAt = new Date();
    session.duration =
      (session.endedAt.getTime() - session.startedAt.getTime()) / 60000;

    session.mood = mood || null;
    session.reflection = reflection || "";

    await session.save();

    const taskId = Array.isArray(session.tasks) ? session.tasks[0] : null;

    if (!taskId) {
      return res.json({ success: true, session, task: null });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: req.session.userId },
      {
        completed: true,
        hasReflection: true,
        lastMood: mood || "",
        lastReflection: reflection || "",
        reflectedAt: new Date(),
        isPriority: true,
      },
      { new: true },
    );

    return res.json({ success: true, session, task: updatedTask });
  } catch (err) {
    console.error("END SESSION ERROR:", err);
    res.status(500).json({ error: "Could not end focus session" });
  }
});

module.exports = router;
