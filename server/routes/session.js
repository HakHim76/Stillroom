const express = require("express");
const router = express.Router();
const Session = require("../models/Session");

/**
 * START A FOCUS SESSION
 * Accepts either:
 *  - { taskId: "..." } (preferred)
 *  - { tasks: ["...", "..."] } (fallback)
 */
router.post("/start", async (req, res) => {
  try {
    console.log("SESSION OBJECT:", req.session);
    console.log("START BODY:", req.body);

    if (!req.session || !req.session.userId) {
      console.warn("NO USER SESSION");
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { taskId, tasks } = req.body;

    // ✅ Normalize into tasks array no matter what client sends
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

/**
 * END A FOCUS SESSION
 * Requires:
 *  - sessionId
 * Optional:
 *  - mood
 *  - reflection
 */
router.post("/end", async (req, res) => {
  try {
    console.log("END SESSION BODY:", req.body);

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

    // ✅ Security: users can only end their own sessions
    if (String(session.userId) !== String(req.session.userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    session.endedAt = new Date();
    session.duration =
      (session.endedAt.getTime() - session.startedAt.getTime()) / 60000;

    session.mood = mood || null;
    session.reflection = reflection || "";

    await session.save();

    console.log("FOCUS SESSION ENDED:", session._id);

    res.json({ success: true, session });
  } catch (err) {
    console.error("END SESSION ERROR:", err);
    res.status(500).json({ error: "Could not end focus session" });
  }
});

module.exports = router;
