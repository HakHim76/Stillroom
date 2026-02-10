import { useState } from "react";
import { authApi } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const data = await authApi.login(email, password);
      if (typeof onAuth === "function") onAuth(data.user);
      nav("/today");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Login</h2>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", marginBottom: 8 }}
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", marginBottom: 8 }}
        />
        <button>Login</button>
      </form>
    </div>
  );
}
