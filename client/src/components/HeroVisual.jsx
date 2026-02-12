import roomPng from "../../src/assets/stillroomHero.png";

export default function HeroVisual() {
  return (
    <div className="sr-hero__visual" aria-hidden="true">
      <div className="sr-visual__glow" />
      <img className="sr-room" src={roomPng} alt="" />

      <div className="sr-float sr-float--a">
        <div className="sr-float__title">TODAY’S FOCUS</div>
        <div className="sr-float__body">1–3 priorities. Nothing more.</div>
      </div>
      <div className="sr-float sr-float--b">
        <div className="sr-float__title">STORED THOUGHTS</div>
        <div className="sr-float__body">Capture it, return later.</div>
      </div>
      <div className="sr-float sr-float--c">
        <div className="sr-float__title">REFLECTION</div>
        <div className="sr-float__body">End calmer than you started.</div>
      </div>
    </div>
  );
}
