import { Link } from "react-router-dom";

export default function FooterMinimal({ brand, user }) {
  const loggedIn = !!user;

  const links = loggedIn
    ? [
        { to: "/today", label: "Today" },
        { to: "/about", label: "About" },
      ]
    : [
        { to: "/about", label: "About" },
        { to: "/login", label: "Login" },
        { to: "/signup", label: "Get Started" },
      ];

  return (
    <footer className="sr-footer">
      <div className="sr-container sr-footer__inner">
        <div className="sr-footer__brand">
          <span className="sr-brand sr-brand--muted">{brand}</span>
          <span className="sr-footer__meta">© {new Date().getFullYear()}</span>
        </div>

        <div className="sr-footer__links">
          {links.map((l) => (
            <Link key={l.to} className="sr-link" to={l.to}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
