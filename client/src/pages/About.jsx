import "../styles/about.css";
import LandingNav from "../components/LandingNav";
import FooterMinimal from "../components/FooterMinimal";
import { landingContent } from "../content/landingContent";

export default function About() {
  return (
    <div className="sr-page">
      <LandingNav brand={landingContent.brand} />

      <main className="about-main">
        <div className="about-container">
          <h1>About Stillroom</h1>

          <p className="about-lead">
            Why the name <em>Stillroom</em>?
          </p>

          <p>
            In medieval Europe, a still room was a working room inside great
            houses and castles. It wasn’t decorative. It wasn’t meant to impress
            guests. It was practical. It was where herbs were dried, medicines
            were prepared, soaps and candles were made, and food was preserved
            for the winter. It was part kitchen, part laboratory, part pharmacy.
            A quiet place where raw materials were refined into something
            useful.
          </p>

          <p>That idea stayed with us.</p>

          <p>
            Stillroom, the product, is built around the same principle. You
            enter with scattered thoughts, unfinished tasks, mental noise.
            Inside this space, you refine them. You choose what matters. You
            work deliberately. You reflect. And you leave sharper than you
            entered.
          </p>

          <p>
            There’s also the second meaning and this one matters just as much.
            There is still room. Still room for attention. Still room for depth.
            Still room to finish something properly. Even now. Even in a world
            that fragments your focus every five minutes.
          </p>

          <p>
            Modern productivity feels broken. Most tools are loud. They reward
            speed and volume. They encourage you to add more, track more,
            optimize more. But they don’t protect attention. Phones interrupt
            constantly. Notifications train your brain to chase novelty. Task
            lists grow faster than they shrink.
          </p>

          <p>
            {" "}
            <b>Stillroom was built to reverse that trend quietly.</b>{" "}
          </p>

          <p>
            It’s intentionally constrained. You choose one to three priorities
            per day. You focus on one at a time. There’s no countdown timer
            pulling your eyes toward a ticking clock. You end focus when the
            work is done. And when you finish, you reflect.
          </p>

          <p>
            Reflection helps in consolidation. Writing about what you did
            activates metacognition(thinking about your thinking). Research
            shows this strengthens memory consolidation and improves learning
            transfer. Without reflection, effort fades. With reflection,
            progress compounds.
          </p>

          <p>
            Stillroom isn’t about doing more. It’s about doing fewer things...
            properly.
          </p>

          <p className="about-close">
            And remembering that there is still room for that.
          </p>
        </div>
      </main>

      <FooterMinimal
        brand={landingContent.brand}
        links={landingContent.footerLinks}
      />
    </div>
  );
}
