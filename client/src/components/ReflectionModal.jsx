import { useState } from "react";

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

      // backend returns updated task
      if (!data.task) throw new Error("No updated task returned.");

      onDone?.(data.task);
    } catch (e2) {
      setErr(e2.message || "Could not save reflection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "white",
          width: "min(560px, 100%)",
          borderRadius: 10,
          padding: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Reflection</h3>
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Mood</label>
            <input
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g. calm, distracted, locked-in"
              style={{ width: "100%" }}
              disabled={saving}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 6 }}>
              What happened?
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write a short reflection…"
              style={{ width: "100%", minHeight: 120 }}
              disabled={saving}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              style={{ background: "#eee" }}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Finish Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
