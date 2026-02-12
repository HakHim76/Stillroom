import { Link } from "react-router-dom";
import { authApi } from "../api/auth";

export default function LandingNav({ brand, user, onLogout }) {
  const loggedIn = !!user;

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      onLogout?.();
    }
  }

  return (
    <header className="sr-nav">
      <div className="sr-nav__inner">
        <Link className="sr-brand" to="/">
          {brand}
        </Link>

        <nav className="sr-nav__links">
          <Link to="/about">About</Link>

          {loggedIn ? (
            <>
              <Link className="sr-link" to="/today">
                Today
              </Link>

              <button
                type="button"
                className="sr-btn sr-btn--ghost"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="sr-link" to="/login">
                Login
              </Link>
              <Link className="sr-btn sr-btn--ghost" to="/signup">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
