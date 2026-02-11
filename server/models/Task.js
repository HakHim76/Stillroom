const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    isPriority: { type: Boolean, default: false },
    dueDate: { type: Date, default: null },
    hasReflection: { type: Boolean, default: false },
    lastReflection: { type: String, default: "" },
    lastMood: { type: String, default: "" },
    reflectedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
