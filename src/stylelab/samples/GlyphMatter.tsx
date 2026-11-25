import { useEffect, useRef, type FC } from "react";
import { LAB_PROFILE, LAB_WORKS } from "../content";
import "./glyph.css";

const CHARSET = " .:-=+*#%@";

const GlyphPanel: FC<{ seed: string }> = ({ seed }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let alive = true;
    let t0 = performance.now();

    const hash = (x: number, y: number, t: number) => {
      const n = Math.sin(x * 12.9898 + y * 78.233 + seed.length * 4.1 + t * 0.15) * 43758.5453;
      return n - Math.floor(n);
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };
    resize();

    const draw = (now: number) => {
      if (!alive) return;
      const t = reduced ? 0 : (now - t0) / 1000;
      const { width: w, height: h } = canvas;
      const cell = Math.max(10, Math.round(12 * Math.min(devicePixelRatio || 1, 1.5)));
      ctx.fillStyle = "#070a08";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `600 ${Math.floor(cell * 0.85)}px "IBM Plex Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const n = hash(x, y, t);
          const edge = x < 1 || y < 1 || x > cols - 2 || y > rows - 2 ? 0.35 : 0;
          const L = Math.min(1, n * 0.75 + edge);
          const ch = CHARSET[Math.floor(L * (CHARSET.length - 1))];
          if (ch === " ") continue;
          const g = Math.floor(140 + L * 100);
          ctx.fillStyle = `rgb(${Math.floor(g * 0.55)}, ${g}, ${Math.floor(g * 0.7)})`;
          ctx.fillText(ch, x * cell + cell / 2, y * cell + cell / 2);
        }
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    const onResize = () => {
      resize();
      if (reduced) draw(performance.now());
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [seed]);

  return <canvas ref={ref} className="glyph-panel" aria-hidden />;
};

export const GlyphMatter: FC = () => (
  <div className="glyph">
    <header className="glyph-top">
      <span>{LAB_PROFILE.handle}</span>
      <span>04 · GLYPH MATTER · material</span>
    </header>
    <main className="glyph-main">
      <div className="glyph-hero">
        <GlyphPanel seed="hero" />
        <div className="glyph-hero-copy">
          <p className="glyph-kicker">glyphs as matter · not overlay</p>
          <h1 className="glyph-name">{LAB_PROFILE.name}</h1>
          <p className="glyph-phrase">{LAB_PROFILE.phrase}</p>
        </div>
      </div>
      <div className="glyph-works">
        {LAB_WORKS.map((w) => (
          <a
            key={w.title}
            className="glyph-work"
            href={w.href}
            target={w.external ? "_blank" : undefined}
            rel={w.external ? "noreferrer" : undefined}
          >
            <div className="glyph-work-mat">
              <GlyphPanel seed={w.title} />
            </div>
            <div className="glyph-work-copy">
              <strong>{w.title}</strong>
              <span>{w.text}</span>
            </div>
          </a>
        ))}
      </div>
      <a className="glyph-mail" href={`mailto:${LAB_PROFILE.email}`}>
        {LAB_PROFILE.email}
      </a>
    </main>
  </div>
);
