import { useEffect, useMemo, useState } from "react";
import { tasksApi } from "../api/tasks";
import { authApi } from "../api/auth";
import ReflectionModal from "../components/ReflectionModal";
import "../styles/today.css";

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

  const displayName = user?.username || user?.email;

  return (
    <div className="sr-page">
      <div className="sr-shell">
        <header className="sr-header">
          <div>
            <h2 className="sr-title">Stillroom — Today</h2>
            <div className="sr-subtitle">
              Constraint → focus → reflection → growth
            </div>
          </div>

          <div className="sr-userbar">
            <span className="sr-chip">{displayName}</span>
            <button className="sr-btn sr-btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {err && <div className="sr-alert">{err}</div>}

        <form className="sr-toolbar" onSubmit={addTask}>
          <input
            className="sr-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task…"
            disabled={!!activeSession}
          />
          <button className="sr-btn sr-btn-primary" disabled={!!activeSession}>
            Add
          </button>
        </form>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="sr-grid">
            <section className="sr-card">
              <h3>Today's Focus</h3>
              {priority.length === 0 ? (
                <p className="sr-empty">None</p>
              ) : (
                <ul className="sr-list">
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
                      <li key={t._id} className="sr-task">
                        <div className="sr-taskRow">
                          <input
                            className="sr-checkbox"
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => toggleComplete(t._id, t.completed)}
                            disabled={checkboxDisabled}
                          />

                          <div className="sr-taskMain">
                            <div
                              className={[
                                "sr-taskTitle",
                                t.completed ? "sr-taskTitleCompleted" : "",
                              ].join(" ")}
                              title={t.title}
                            >
                              {t.title}
                            </div>

                            <div className="sr-taskMeta">
                              {t.hasReflection ? (
                                <span className="sr-pill">
                                  Locked after reflection
                                </span>
                              ) : (
                                <span className="sr-pill">Prioritized</span>
                              )}
                              {isSessionTask ? (
                                <span className="sr-pill sr-sessionPill">
                                  Session in progress
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="sr-actions">
                            <button
                              className="sr-btn"
                              onClick={() =>
                                togglePriority(t._id, t.isPriority)
                              }
                              disabled={unprioritizeDisabled || t.hasReflection}
                              title={
                                t.hasReflection
                                  ? "This task is locked after reflection."
                                  : ""
                              }
                            >
                              Unprioritize
                            </button>

                            {!isSessionTask ? (
                              <button
                                className="sr-btn sr-btn-primary"
                                onClick={() => startFocusSession(t._id)}
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
                                className="sr-btn sr-btn-primary"
                                onClick={openEndSessionReflection}
                                disabled={showReflection}
                              >
                                End Session
                              </button>
                            )}

                            <button
                              className="sr-btn sr-btn-danger"
                              onClick={() => deleteTask(t._id)}
                              disabled={deleteDisabled}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {isSessionTask && (
                          <div className="sr-hint">
                            Stillroom doesn’t use a timer. Focus ends when{" "}
                            <b>you</b> decide the work is done… not when a clock
                            does.
                          </div>
                        )}

                        {t.hasReflection && (
                          <div className="sr-reflection">
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
              )}
            </section>

            <section className="sr-card">
              <h3>Everything else</h3>
              {normal.length === 0 ? (
                <p className="sr-empty">None</p>
              ) : (
                <ul className="sr-list">
                  {normal.map((t) => {
                    const anySession = !!activeSession;
                    const priorityDisabled = anySession || t.completed;

                    return (
                      <li key={t._id} className="sr-task">
                        <div className="sr-taskRow">
                          <input
                            className="sr-checkbox"
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => toggleComplete(t._id, t.completed)}
                            disabled={anySession}
                          />

                          <div className="sr-taskMain">
                            <div
                              className={[
                                "sr-taskTitle",
                                t.completed ? "sr-taskTitleCompleted" : "",
                              ].join(" ")}
                              title={t.title}
                            >
                              {t.title}
                            </div>
                            <div className="sr-taskMeta">
                              {t.completed ? (
                                <span className="sr-pill">Completed</span>
                              ) : (
                                <span className="sr-pill">Available</span>
                              )}
                            </div>
                          </div>

                          <div className="sr-actions">
                            <button
                              className="sr-btn"
                              onClick={() =>
                                togglePriority(t._id, t.isPriority)
                              }
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
                              className="sr-btn sr-btn-danger"
                              onClick={() => deleteTask(t._id)}
                              disabled={anySession}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}

        {activeSession && showReflection && (
          <ReflectionModal
            sessionId={activeSession.sessionId}
            onCancel={cancelReflection}
            onDone={finishReflection}
          />
        )}
      </div>
    </div>
  );
}
