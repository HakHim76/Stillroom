import { useState } from "react";
import { authApi } from "../api/auth";
import { Link } from "react-router-dom";
import "../styles/Auth.css";
import useFlash from "../hooks/useFlash";
import LandingNav from "../components/LandingNav";
import FooterMinimal from "../components/FooterMinimal";
import { landingContent } from "../Content/landingContent";

import logo from "../assets/stillroom-logo.svg";

const emailRegex = /^\S+@\S+\.\S+$/;

function validateAuth({ email, password, confirm }) {
  if (!emailRegex.test(email)) return "That email doesn’t look right.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (confirm !== undefined && password !== confirm)
    return "Passwords don’t match.";
  return null;
}

export default function Signup({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const flash = useFlash();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const onUsername = (e) => setUsername(e.target.value);
  const onEmail = (e) => setEmail(e.target.value);
  const onPassword = (e) => setPassword(e.target.value);
  const onConfirm = (e) => setConfirm(e.target.value);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    const errorMsg = validateAuth({ email, password, confirm });
    if (errorMsg) {
      setErr(errorMsg);
      flash.warn(errorMsg);
      return;
    }

    setBusy(true);
    try {
      await authApi.signup(username, email, password);
      const me = await authApi.me();
      onSuccess?.(me.user);
      flash.success("Your stillroom is ready.");
    } catch (e2) {
      setErr(e2.message);
      flash.error(e2.message || "Signup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sr-page">
      <LandingNav brand={landingContent.brand} />

      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-top">
            <Link to="/" className="sr-authBrand" aria-label="Home">
              <img src={logo} alt="Stillroom" className="sr-authLogo" />
            </Link>

            <div>
              <h2 className="auth-title">Create your Stillroom</h2>
              <p className="auth-sub">A small step toward calmer work.</p>
            </div>
          </div>

          {err && <div className="auth-error">{err}</div>}

          <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
            <div className="auth-field">
              <label htmlFor="sr-signup-username">Username</label>
              <input
                id="sr-signup-username"
                name="username"
                autoComplete="username"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={onUsername}
                onInput={onUsername}
                placeholder="your name"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="sr-signup-email">Email</label>
              <input
                id="sr-signup-email"
                name="email"
                type="email"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                inputMode="email"
                value={email}
                onChange={onEmail}
                onInput={onEmail}
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-field">
              <div className="auth-labelRow">
                <label htmlFor="sr-signup-password">Password</label>
                <button
                  type="button"
                  className="auth-peek"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>

              <input
                id="sr-signup-password"
                name="new-password"
                autoComplete="new-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={onPassword}
                onInput={onPassword}
                placeholder="••••••••"
              />
            </div>

            <div className="auth-field">
              <div className="auth-labelRow">
                <label htmlFor="sr-signup-confirm">Confirm password</label>
                <button
                  type="button"
                  className="auth-peek"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>

              <input
                id="sr-signup-confirm"
                name="confirm-password"
                autoComplete="new-password"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={onConfirm}
                onInput={onConfirm}
                placeholder="••••••••"
              />
            </div>

            <button className="auth-btn" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </button>

            <div className="auth-foot">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </form>
        </div>
      </main>

      <FooterMinimal brand={landingContent.brand} />
    </div>
  );
}
