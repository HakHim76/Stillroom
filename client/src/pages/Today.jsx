import { useEffect, useMemo, useState } from "react";
import { tasksApi } from "../api/tasks";
import ReflectionModal from "../components/ReflectionModal";
import "../styles/Today.css";
import LandingNav from "../components/LandingNav";
import useFlash from "../hooks/useFlash";
import { landingContent } from "../Content/landingContent";

export default function Today({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const flash = useFlash();

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
      .catch((e) => {
        setErr(e.message);
      })
      .finally(() => setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const priority = useMemo(() => tasks.filter((t) => t.isPriority), [tasks]);
  const normal = useMemo(() => tasks.filter((t) => !t.isPriority), [tasks]);

  const priorityCapReached = priority.length >= 3;

  async function addTask(e) {
    e.preventDefault();
    setErr("");
    if (!title.trim()) return;

    try {
      const data = await tasksApi.create(title);
      setTasks((prev) => [data.task, ...prev]);
      setTitle("");
      flash.success("Task added.");
    } catch (e) {
      setErr(e.message);
      flash.error(e.message || "Couldn’t add task.");
    }
  }

  async function toggleComplete(id, current) {
    try {
      const data = await tasksApi.patch(id, { completed: !current });
      setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));

      flash.info(!current ? "Marked complete." : "Marked incomplete.");
    } catch (e) {
      setErr(e.message);
      flash.error(e.message || "Couldn’t update task.");
    }
  }

  async function togglePriority(id, current) {
    // turning priority ON, enforce cap of 3
    if (!current) {
      const priorityCount = tasks.filter((t) => t.isPriority).length;
      if (priorityCount >= 3) {
        setErr("You can only prioritize 3 tasks per day.");
        flash.warn("Only 3 tasks can be prioritized.");
        return;
      }
    }

    try {
      const data = await tasksApi.patch(id, { isPriority: !current });
      setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));

      flash.info(!current ? "Moved to focus." : "Removed from focus.");
    } catch (e) {
      setErr(e.message);
      flash.error(e.message || "Couldn’t update priority.");
    }
  }

  async function deleteTask(id) {
    try {
      await tasksApi.remove(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      flash.info("Task deleted.");
    } catch (e) {
      setErr(e.message);
      flash.error(e.message || "Couldn’t delete task.");
    }
  }

  async function startFocusSession(taskId) {
    if (!taskId) return;
    if (activeSession) {
      flash.warn("A session is already running.");
      return;
    }

    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    if (task.completed) {
      setErr("This task is already completed.");
      flash.warn("Completed tasks can’t start sessions.");
      return;
    }
    if (task.hasReflection) {
      setErr("This task already has a reflection. One session per task.");
      flash.warn("This task is locked after reflection.");
      return;
    }
    if (!task.isPriority) {
      setErr("You can only start a session from a prioritized task.");
      flash.warn("Prioritize this task to start a session.");
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
      flash.success("Focus session started.");
    } catch (e) {
      setErr(e.message || "Could not start session.");
      flash.error(e.message || "Could not start session.");
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

    flash.success("Reflection saved. Task complete.");
  }

  return (
    <div className="sr-page">
      <LandingNav brand="Stillroom" user={user} onLogout={onLogout} />

      <div className="sr-shell">
        <header className="sr-header">
          <div>
            <h1 className="sr-title">Today</h1>
            <div className="sr-subtitle">
              Constraint → focus → reflection → growth
            </div>
          </div>
        </header>

        {err && <div className="sr-alert">{err}</div>}

        {/* NEW: clear banner when session is running */}
        {activeSession ? (
          <div className="sr-sessionBanner">
            <div>
              <b>Session in progress</b> — One task. Full focus.
            </div>
          </div>
        ) : null}

        <form className="sr-toolbar" onSubmit={addTask}>
          <input
            className="sr-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              activeSession
                ? "Session running — add tasks after"
                : "Add a task…"
            }
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
              <h3>Prioritized</h3>

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
                      <li
                        key={t._id}
                        className={[
                          "sr-task",
                          isSessionTask ? "sr-task--active" : "",
                        ].join(" ")}
                      >
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
                          </div>

                          <div className="sr-actions">
                            <button
                              className="sr-btn"
                              type="button"
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
                                type="button"
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
                                type="button"
                                onClick={openEndSessionReflection}
                                disabled={showReflection}
                              >
                                End Session
                              </button>
                            )}

                            <button
                              className="sr-btn sr-btn-danger"
                              type="button"
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

                    // completed tasks in Everything else cannot be prioritized
                    const priorityDisabled =
                      anySession || t.completed || priorityCapReached;

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
                          </div>

                          <div className="sr-actions">
                            <button
                              className="sr-btn"
                              type="button"
                              onClick={() =>
                                togglePriority(t._id, t.isPriority)
                              }
                              disabled={priorityDisabled}
                              title={
                                priorityCapReached
                                  ? "You can only prioritize 3 tasks."
                                  : t.completed
                                    ? "Completed tasks can’t be prioritized."
                                    : ""
                              }
                            >
                              Prioritize
                            </button>

                            <button
                              className="sr-btn sr-btn-danger"
                              type="button"
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
