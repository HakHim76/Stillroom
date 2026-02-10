import "../styles/landing.css";
import { landingContent } from "../content/landingContent";
import LandingNav from "../components/LandingNav";
import HeroSection from "../components/HeroSection";
import PillarsSection from "../components/PillarsSection";
import FooterMinimal from "../components/FooterMinimal";

export default function LandingPage() {
  return (
    <div className="sr-page">
      <LandingNav brand={landingContent.brand} />

      <main>
        <HeroSection content={landingContent} />
        <PillarsSection id="how" pillars={landingContent.pillars} />
      </main>

      <FooterMinimal
        brand={landingContent.brand}
        links={landingContent.footerLinks}
      />
    </div>
  );
}
