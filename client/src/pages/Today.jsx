import { useEffect, useMemo, useState } from "react";
import { tasksApi } from "../api/tasks";
import { authApi } from "../api/auth";
import ReflectionModal from "../components/ReflectionModal";

export default function Today({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Focus session state
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    tasksApi
      .list()
      .then((data) => {
        if (!alive) return;
        setTasks(data.tasks);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const priority = useMemo(() => tasks.filter((t) => t.isPriority), [tasks]);
  const normal = useMemo(() => tasks.filter((t) => !t.isPriority), [tasks]);

  async function addTask(e) {
    e.preventDefault();
    setErr("");
    if (!title.trim()) return;
    try {
      const data = await tasksApi.create(title);
      setTasks((prev) => [data.task, ...prev]);
      setTitle("");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function toggleComplete(id, current) {
    try {
      const data = await tasksApi.patch(id, { completed: !current });
      setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
    } catch (e) {
      setErr(e.message);
    }
  }

  async function togglePriority(id, current) {
    try {
      const data = await tasksApi.patch(id, { isPriority: !current });
      setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
    } catch (e) {
      setErr(e.message);
    }
  }

  async function deleteTask(id) {
    try {
      await tasksApi.remove(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handleLogout() {
    await authApi.logout();
    onLogout();
  }

  // 🔹 4b: START FOCUS SESSION
  async function startFocusSession() {
    if (priority.length === 0 || priority.length > 3) {
      setErr("Select 1–3 prioritized tasks to start a focus session.");
      return;
    }

    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tasks: priority.map((t) => t._id),
        }),
      });

      const data = await res.json();
      setActiveSession(data.sessionId);
    } catch (e) {
      setErr("Could not start focus session.");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Stillroom — Today</h2>
        <div>
          <span style={{ marginRight: 12 }}>{user?.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <form onSubmit={addTask} style={{ marginBottom: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          style={{ marginRight: 8 }}
          disabled={!!activeSession}
        />
        <button disabled={!!activeSession}>Add</button>
      </form>

      {/* 🔹 Focus control */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={startFocusSession} disabled={!!activeSession}>
          Start Focus Session
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <section style={{ marginBottom: 16 }}>
            <h3>Prioritize</h3>
            {priority.length === 0 ? <p>None</p> : null}
            <ul>
              {priority.map((t) => (
                <li key={t._id}>
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleComplete(t._id, t.completed)}
                    disabled={!!activeSession}
                  />
                  <span
                    style={{
                      margin: "0 8px",
                      textDecoration: t.completed ? "line-through" : "none",
                    }}
                  >
                    {t.title}
                  </span>
                  <button
                    onClick={() => togglePriority(t._id, t.isPriority)}
                    disabled={!!activeSession}
                  >
                    Unprioritize
                  </button>
                  <button
                    onClick={() => deleteTask(t._id)}
                    style={{ marginLeft: 6 }}
                    disabled={!!activeSession}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Everything else</h3>
            {normal.length === 0 ? <p>None</p> : null}
            <ul>
              {normal.map((t) => (
                <li key={t._id}>
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleComplete(t._id, t.completed)}
                    disabled={!!activeSession}
                  />
                  <span
                    style={{
                      margin: "0 8px",
                      textDecoration: t.completed ? "line-through" : "none",
                    }}
                  >
                    {t.title}
                  </span>
                  <button
                    onClick={() => togglePriority(t._id, t.isPriority)}
                    disabled={!!activeSession}
                  >
                    Priority
                  </button>
                  <button
                    onClick={() => deleteTask(t._id)}
                    style={{ marginLeft: 6 }}
                    disabled={!!activeSession}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* 🔹 6: Reflection modal rendering */}
      {activeSession && (
        <ReflectionModal
          sessionId={activeSession}
          onDone={() => setActiveSession(null)}
        />
      )}
    </div>
  );
}
