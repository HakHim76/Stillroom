import BackgroundWordmark from "./BackgroundWordmark";
import HeroCopy from "./HeroCopy";
import HeroVisual from "./HeroVisual";

export default function HeroSection({ content }) {
  return (
    <section className="sr-hero">
      <div className="sr-container sr-hero__grid">
        {/* / BACK LAYER */}
        <BackgroundWordmark text={content.brand.toUpperCase()} />
        {/* / FRONT LAYER (copy + buttons) */}
        <HeroCopy content={content} />
        {/* / MIDDLE LAYER (PNG + glow + floating cards) */}
        <HeroVisual />
      </div>
    </section>
  );
}
