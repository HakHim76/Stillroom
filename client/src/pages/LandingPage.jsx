import "../styles/Landing.css";
import { useMemo, useState } from "react";
import { landingContent } from "../Content/landingContent";
import { INSIGHTS } from "../Content/insights";
import LandingNav from "../components/LandingNav";
import HeroSection from "../components/HeroSection";
import PillarsSection from "../components/PillarsSection";
import FooterMinimal from "../components/FooterMinimal";
import { landingContent } from "../Content/landingContent";

export default function LandingPage({ user, onLogout }) {
  const todayKey = new Date().toISOString().slice(0, 10);

  const initialIndex = useMemo(() => {
    const savedDay = localStorage.getItem("stillroom_insight_day");
    const savedIdx = localStorage.getItem("stillroom_insight_idx");

    if (savedDay === todayKey && savedIdx !== null) {
      const n = Number(savedIdx);
      return Number.isFinite(n) ? n % INSIGHTS.length : 0;
    }

    const idx = Math.floor(Math.random() * INSIGHTS.length);
    localStorage.setItem("stillroom_insight_day", todayKey);
    localStorage.setItem("stillroom_insight_idx", String(idx));
    return idx;
  }, [todayKey]);

  const [insightIndex, setInsightIndex] = useState(initialIndex);

  function nextInsight() {
    const idx = (insightIndex + 1) % INSIGHTS.length;
    setInsightIndex(idx);
    localStorage.setItem("stillroom_insight_day", todayKey);
    localStorage.setItem("stillroom_insight_idx", String(idx));
  }

  const insight = INSIGHTS[insightIndex] || INSIGHTS[0];

  return (
    <div className="sr-page">
      <LandingNav
        brand={landingContent.brand}
        user={user}
        onLogout={onLogout}
      />

      <main>
        <HeroSection content={landingContent} />

        {/* ✅ Insights */}
        <section className="sr-insights">
          <div className="sr-insights__inner">
            <div className="sr-insights__header">
              <div>
                <div className="sr-insights__kicker">INSIGHTS</div>
                <h2 className="sr-insights__title">Train your attention.</h2>
              </div>

              <button
                className="sr-insights__next"
                onClick={nextInsight}
                type="button"
              >
                Next
              </button>
            </div>

            <div className="sr-insights__card">
              <div className="sr-insights__cardTitle">{insight.title}</div>
              <div className="sr-insights__body">{insight.body}</div>
            </div>
          </div>
        </section>

        <PillarsSection id="how" pillars={landingContent.pillars} />
      </main>

      <FooterMinimal brand={landingContent.brand} user={user} />
    </div>
  );
}
