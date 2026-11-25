import { useEffect, useRef, type FC } from "react";
import "./glyph.css";

const CHARS = " .:-=+*#%@█▓▒░";

export const GlyphMatter: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -1, y: -1 };
    let raf = 0;
    let alive = true;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    };
    resize();

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = canvas.width / rect.width;
      pointer.x = (e.clientX - rect.left) * dpr;
      pointer.y = (e.clientY - rect.top) * dpr;
    };

    const draw = (t: number) => {
      if (!alive) return;
      const { width: w, height: h } = canvas;
      const cell = Math.max(11, Math.round(14 * Math.min(devicePixelRatio || 1, 1.5)));
      ctx.fillStyle = "#050806";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `600 ${Math.floor(cell * 0.86)}px "IBM Plex Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = x * cell + cell / 2;
          const py = y * cell + cell / 2;
          const dx = pointer.x < 0 ? 9999 : px - pointer.x;
          const dy = pointer.y < 0 ? 9999 : py - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const wave = Math.sin(x * 0.35 + y * 0.28 + t * 0.003) * 0.5 + 0.5;
          const heat = Math.max(0, 1 - dist / (cell * 8));
          const L = Math.min(1, wave * 0.45 + heat * 0.7);
          const ch = CHARS[Math.floor(L * (CHARS.length - 0.001))];
          if (ch === " ") continue;
          const g = Math.floor(90 + L * 150);
          ctx.fillStyle = `rgb(${Math.floor(g * 0.45)},${g},${Math.floor(g * 0.65)})`;
          ctx.fillText(ch, px, py);
        }
      }

      ctx.fillStyle = "rgba(125,255,179,0.9)";
      ctx.font = `700 ${Math.floor(Math.min(w, h) * 0.06)}px "IBM Plex Mono", monospace`;
      ctx.textAlign = "left";
      ctx.fillText("GLYPH", w * 0.07, h * 0.88);
      ctx.fillStyle = "rgba(125,255,179,0.45)";
      ctx.font = `500 ${Math.floor(Math.min(w, h) * 0.02)}px "IBM Plex Mono", monospace`;
      ctx.fillText("материя из символов · не фильтр поверх", w * 0.07, h * 0.93);

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="glyph-room">
      <canvas ref={ref} className="glyph-canvas" />
      <p className="glyph-sig">35gif / 04</p>
    </div>
  );
};
