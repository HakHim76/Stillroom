const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  duration: Number, // minutes
  startedAt: Date,
  endedAt: Date,
  mood: String, // calm | neutral | stressed
  reflection: String,
});

module.exports = mongoose.model("Session", sessionSchema);
