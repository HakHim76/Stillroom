import { useEffect, useMemo, useState } from "react";
import { tasksApi } from "../api/tasks";
import { authApi } from "../api/auth";
import ReflectionModal from "../components/ReflectionModal";

export default function Today({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeSession, setActiveSession] = useState(null);

  const [showReflection, setShowReflection] = useState(false);

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

  // start focus on a specific task (only if NOT completed and NO reflection)
  async function startFocusSession(taskId) {
    if (!taskId) return;
    if (activeSession) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    if (task.completed) {
      setErr("This task is already completed.");
      return;
    }
    if (task.hasReflection) {
      setErr("This task already has a reflection. One session per task.");
      return;
    }
    if (!task.isPriority) {
      setErr("You can only start a session from a prioritized task.");
      return;
    }

    setErr("");

    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ taskId }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) throw new Error(data?.message || "Could not start session.");

      setActiveSession({ sessionId: data.sessionId, taskId });
    } catch (e) {
      setErr(e.message || "Could not start session.");
    }
  }

  function openEndSessionReflection() {
    if (!activeSession) return;
    setShowReflection(true);
  }

  function cancelReflection() {
    setShowReflection(false);
  }

  function finishReflection(updatedTask) {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
    );
    setShowReflection(false);
    setActiveSession(null);
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

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <section style={{ marginBottom: 16 }}>
            <h3>Prioritize</h3>
            {priority.length === 0 ? <p>None</p> : null}

            <ul>
              {priority.map((t) => {
                const isSessionTask = activeSession?.taskId === t._id;
                const anySession = !!activeSession;

                const lockForever = !!t.hasReflection;
                const startDisabled =
                  anySession || t.completed || t.hasReflection;
                const unprioritizeDisabled = anySession || lockForever;
                const checkboxDisabled = anySession;
                const deleteDisabled = anySession;

                return (
                  <li key={t._id} style={{ marginBottom: 10 }}>
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => toggleComplete(t._id, t.completed)}
                      disabled={checkboxDisabled}
                    />
                    <span
                      style={{
                        margin: "0 8px",
                        textDecoration: t.completed ? "line-through" : "none",
                        fontWeight: isSessionTask ? 700 : 400,
                      }}
                    >
                      {t.title} {isSessionTask ? "— Session in progress" : null}
                    </span>
                    /Unprioritize disabled after reflection
                    <button
                      onClick={() => togglePriority(t._id, t.isPriority)}
                      disabled={unprioritizeDisabled || t.hasReflection}
                      title={
                        t.hasReflection
                          ? "This task is locked after reflection."
                          : ""
                      }
                    >
                      Unprioritize
                    </button>
                    / Start Focus only if no task reflection and is not
                    completed
                    {!isSessionTask ? (
                      <button
                        onClick={() => startFocusSession(t._id)}
                        style={{ marginLeft: 6 }}
                        disabled={startDisabled}
                        title={
                          t.hasReflection
                            ? "One session per task."
                            : t.completed
                              ? "Completed tasks can’t be focused."
                              : anySession
                                ? "A session is already running."
                                : ""
                        }
                      >
                        Start Focus
                      </button>
                    ) : (
                      <button
                        onClick={openEndSessionReflection}
                        style={{ marginLeft: 6 }}
                        disabled={showReflection}
                      >
                        End Session
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(t._id)}
                      style={{ marginLeft: 6 }}
                      disabled={deleteDisabled}
                    >
                      Delete
                    </button>
                    {isSessionTask && (
                      <div
                        style={{
                          marginLeft: 26,
                          marginTop: 6,
                          fontSize: 13,
                          opacity: 0.85,
                        }}
                      >
                        Stillroom doesn’t use a timer. Focus ends when{" "}
                        <b>you</b> decide the work is done... not when a clock
                        does.
                      </div>
                    )}
                    {t.hasReflection && (
                      <div
                        style={{ marginLeft: 26, marginTop: 6, fontSize: 13 }}
                      >
                        <div>
                          <b>Reflection:</b> {t.lastReflection || "—"}
                        </div>
                        {t.lastMood ? (
                          <div>
                            <b>Mood:</b> {t.lastMood}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h3>Everything else</h3>
            {normal.length === 0 ? <p>None</p> : null}

            <ul>
              {normal.map((t) => {
                const anySession = !!activeSession;

                // completed tasks in Everything else cannot be prioritized
                const priorityDisabled = anySession || t.completed;

                return (
                  <li key={t._id} style={{ marginBottom: 10 }}>
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => toggleComplete(t._id, t.completed)}
                      disabled={anySession}
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
                      disabled={priorityDisabled}
                      title={
                        t.completed
                          ? "Completed tasks can’t be prioritized."
                          : ""
                      }
                    >
                      Prioritize
                    </button>

                    <button
                      onClick={() => deleteTask(t._id)}
                      style={{ marginLeft: 6 }}
                      disabled={anySession}
                    >
                      Delete
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}

      {activeSession && showReflection && (
        <ReflectionModal
          sessionId={activeSession.sessionId}
          onCancel={cancelReflection}
          onDone={finishReflection}
        />
      )}
    </div>
  );
}
