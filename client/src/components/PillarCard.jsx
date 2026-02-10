export default function PillarCard({ title, body }) {
  return (
    <article className="sr-card">
      <div className="sr-card__title">{title}</div>
      <p className="sr-card__body">{body}</p>
    </article>
  );
}
