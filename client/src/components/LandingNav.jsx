import { Link, NavLink } from "react-router-dom";
import { authApi } from "../api/auth";
import logo from "../assets/stillroom-logo.svg";

export default function LandingNav({ brand, user, onLogout }) {
  const loggedIn = !!user;
  const displayName = user?.username || user?.email;

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
        <Link className="sr-brandWrap" to="/" aria-label={`${brand} Home`}>
          <img className="sr-brandLogo" src={logo} alt="" />
          <span className="sr-brandText">{brand}</span>
        </Link>

        <nav className="sr-nav__links">
          {loggedIn ? (
            <>
              <NavLink to="/" className="sr-link">
                Home
              </NavLink>

              <NavLink to="/today" className="sr-link">
                Today
              </NavLink>

              <NavLink to="/about" className="sr-link">
                About
              </NavLink>

              <span className="sr-userChip">{displayName}</span>

              <button className="sr-btn sr-btn--ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/about" className="sr-link">
                About
              </NavLink>

              <NavLink to="/login" className="sr-link">
                Login
              </NavLink>

              <NavLink to="/signup" className="sr-btn sr-btn--ghost">
                Get Started
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
