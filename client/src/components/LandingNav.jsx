import { Link } from "react-router-dom";

export default function LandingNav({ brand }) {
  return (
    <header className="sr-nav">
      <div className="sr-nav__inner">
        <Link className="sr-brand" to="/">
          {brand}
        </Link>

        <nav className="sr-nav__links">
          <Link className="sr-link" to="/login">
            Login
          </Link>
          <Link className="sr-btn sr-btn--ghost" to="/signup">
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
