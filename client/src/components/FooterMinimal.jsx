import { Link } from "react-router-dom";

export default function FooterMinimal({ brand, links }) {
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
