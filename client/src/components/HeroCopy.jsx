import { Link } from "react-router-dom";

export default function HeroCopy({ content }) {
  return (
    <div className="sr-hero__copy">
      <p className="sr-kicker">Quiet refuge • Student focus • Calm progress</p>

      <h1 className="sr-h1">{content.headline}</h1>
      <p className="sr-lead">{content.subtext}</p>

      <div className="sr-cta">
        <Link className="sr-btn sr-btn--primary" to={content.ctas.primary.to}>
          {content.ctas.primary.label}
        </Link>

        <a className="sr-btn sr-btn--ghost" href={content.ctas.secondary.to}>
          {content.ctas.secondary.label}
        </a>
      </div>
    </div>
  );
}
