import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { authApi } from "../api/auth";
import logo from "../assets/stillroom-logo.svg";

export default function LandingNav({ brand, user, onLogout }) {
  const loggedIn = !!user;
  const displayName = user?.username || user?.email;

  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      setMenuOpen(false);
      onLogout?.();
    }
  }

  // Close menu on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 720) setMenuOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sr-nav">
      {menuOpen && <div className="sr-navBackdrop" onClick={closeMenu} />}

      <div className="sr-nav__inner">
        <Link
          className="sr-brandWrap"
          to="/"
          aria-label={`${brand} Home`}
          onClick={closeMenu}
        >
          <img className="sr-brandLogo" src={logo} alt="" />
          <span className="sr-brandText">{brand}</span>
        </Link>

        <button
          type="button"
          className="sr-navToggle"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="sr-navToggle__bar" />
          <span className="sr-navToggle__bar" />
          <span className="sr-navToggle__bar" />
        </button>

        <nav
          className={`sr-nav__links ${menuOpen ? "sr-nav__links--open" : ""}`}
        >
          {loggedIn ? (
            <>
              <NavLink to="/" className="sr-link" onClick={closeMenu}>
                Home
              </NavLink>

              <NavLink to="/today" className="sr-link" onClick={closeMenu}>
                Today
              </NavLink>

              <NavLink to="/about" className="sr-link" onClick={closeMenu}>
                About
              </NavLink>

              <span className="sr-userChip">{displayName}</span>

              <button className="sr-btn sr-btn--ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/about" className="sr-link" onClick={closeMenu}>
                About
              </NavLink>

              <NavLink to="/login" className="sr-link" onClick={closeMenu}>
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="sr-btn sr-btn--ghost"
                onClick={closeMenu}
              >
                Get Started
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
