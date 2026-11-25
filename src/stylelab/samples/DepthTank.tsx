import { useEffect, useRef, type FC } from "react";
import { LAB_PROFILE, LAB_WORKS } from "../content";
import "./depth.css";

const Rays: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let alive = true;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    };
    resize();

    const draw = (t: number) => {
      if (!alive) return;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.55;
      const cy = -h * 0.05;
      for (let i = 0; i < 7; i++) {
        const a = -0.55 + i * 0.16 + Math.sin(t * 0.0003 + i) * 0.03;
        const len = h * 1.35;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a + 1.2) * len);
        ctx.lineTo(cx + Math.cos(a + 0.08) * len, cy + Math.sin(a + 1.28) * len);
        ctx.closePath();
        const g = ctx.createLinearGradient(cx, cy, cx, h);
        g.addColorStop(0, "rgba(120, 220, 255, 0.14)");
        g.addColorStop(0.55, "rgba(80, 180, 220, 0.04)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="depth-rays" aria-hidden />;
};

export const DepthTank: FC = () => (
  <div className="depth">
    <Rays />
    <div className="depth-fog" aria-hidden />
    <header className="depth-top">
      <span>{LAB_PROFILE.handle}</span>
      <span>02 · DEPTH TANK · ABYSS</span>
    </header>
    <main className="depth-main">
      <p className="depth-kicker">coded immersion · depth fog</p>
      <h1 className="depth-name">{LAB_PROFILE.name}</h1>
      <p className="depth-phrase">{LAB_PROFILE.phrase}</p>
      <div className="depth-works">
        {LAB_WORKS.map((w) => (
          <a
            key={w.title}
            className="depth-work"
            href={w.href}
            target={w.external ? "_blank" : undefined}
            rel={w.external ? "noreferrer" : undefined}
          >
            <strong>{w.title}</strong>
            <span>{w.text}</span>
          </a>
        ))}
      </div>
      <a className="depth-mail" href={`mailto:${LAB_PROFILE.email}`}>
        {LAB_PROFILE.email}
      </a>
    </main>
  </div>
);
