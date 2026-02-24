import { useState } from "react";
import "../styles/Today.css";

export default function ReflectionModal({ sessionId, onDone, onCancel }) {
  const [mood, setMood] = useState("");
  const [reflection, setReflection] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);

    try {
      const res = await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId, mood, reflection }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok)
        throw new Error(data?.message || "Could not save reflection.");
      if (!data.task) throw new Error("No updated task returned.");

      onDone?.(data.task);
    } catch (e2) {
      setErr(e2.message || "Could not save reflection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="sr-modalOverlay" role="dialog" aria-modal="true">
      <div className="sr-modal">
        <div className="sr-modalHeader">
          <h3 className="sr-modalTitle">Reflection</h3>
          <button
            className="sr-btn sr-btn-ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Close
          </button>
        </div>

        <div className="sr-modalBody">
          {err && <div className="sr-alert">{err}</div>}

          <form onSubmit={handleSubmit}>
            <div className="sr-field">
              <label className="sr-label">Mood</label>
              <input
                className="sr-input"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="e.g. calm, distracted, locked-in"
                disabled={saving}
              />
            </div>

            <div className="sr-field">
              <label className="sr-label">How did it go?</label>
              <textarea
                className="sr-textarea"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Write a short reflection…"
                disabled={saving}
              />
              <div className="sr-mutedNote">
                One or two sentences is perfect.
              </div>
            </div>

            <div className="sr-modalFooter">
              <button
                type="button"
                className="sr-btn"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="sr-btn sr-btn-primary"
                disabled={saving}
              >
                {saving ? "Saving…" : "Finish Session"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
