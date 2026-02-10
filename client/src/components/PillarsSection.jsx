import PillarCard from "./PillarCard";

export default function PillarsSection({ id, pillars }) {
  return (
    <section className="sr-section" id={id}>
      <div className="sr-container">
        <h2 className="sr-h2">How Stillroom works</h2>
        <p className="sr-sub">
          A quiet workflow that protects your attention and makes progress feel
          lighter.
        </p>

        <div className="sr-pillars">
          {pillars.map((p) => (
            <PillarCard key={p.title} title={p.title} body={p.body} />
          ))}
        </div>
      </div>
    </section>
  );
}
