import { useEffect, useRef, type FC } from "react";
import "./glyph.css";

/** Ansenjeo-adjacent: paint a living scene, then materialize it as colored glyphs. */
const CHARS = " .'`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function noise2(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi + yi * 57);
  const b = hash(xi + 1 + yi * 57);
  const c = hash(xi + (yi + 1) * 57);
  const d = hash(xi + 1 + (yi + 1) * 57);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function fbm(x: number, y: number) {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < 5; i++) {
    v += a * noise2(x * f, y * f);
    f *= 2;
    a *= 0.5;
  }
  return v;
}

export const GlyphMatter: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.55 };
    let raf = 0;
    let alive = true;

    const scene = document.createElement("canvas");
    const sctx = scene.getContext("2d", { willReadFrequently: true })!;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      // low-res scene buffer — glyph source
      const cols = Math.min(140, Math.floor(canvas.clientWidth / 8));
      const rows = Math.min(80, Math.floor(canvas.clientHeight / 11));
      scene.width = Math.max(64, cols);
      scene.height = Math.max(40, rows);
    };
    resize();

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / rect.width;
      pointer.y = (e.clientY - rect.top) / rect.height;
    };

    const paintScene = (t: number) => {
      const w = scene.width;
      const h = scene.height;
      const img = sctx.createImageData(w, h);
      const moonX = 0.72 + Math.sin(t * 0.00015) * 0.02;
      const moonY = 0.22;
      const px = pointer.x;
      const py = pointer.y;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u = x / w;
          const v = y / h;
          const i = (y * w + x) * 4;

          // sky
          let r = 18 + v * 10;
          let g = 28 + v * 18;
          let b = 48 + v * 30;

          // moon glow
          const md = Math.hypot(u - moonX, v - moonY);
          const moon = Math.max(0, 1 - md * 7);
          r += moon * 180;
          g += moon * 170;
          b += moon * 140;

          // hills / terrain silhouette
          const ground =
            0.62 +
            fbm(u * 3.2, 2.1) * 0.12 +
            Math.sin(u * 6 + t * 0.0004) * 0.03 -
            (px - 0.5) * 0.04;
          if (v > ground) {
            const depth = (v - ground) / (1 - ground);
            const grass = fbm(u * 14, v * 10 + t * 0.0002);
            r = 30 + grass * 40 + depth * 20;
            g = 70 + grass * 90 - depth * 30;
            b = 45 + grass * 30;
            // river band
            const river = Math.abs(u - (0.45 + Math.sin(v * 8 + t * 0.0005) * 0.04));
            if (river < 0.06 + fbm(v * 4, 1) * 0.02) {
              const sparkle = 0.5 + 0.5 * Math.sin(t * 0.01 + u * 40 + v * 20);
              r = 40 + sparkle * 40;
              g = 90 + sparkle * 80;
              b = 120 + sparkle * 100;
            }
          }

          // trees as vertical glyph density boosts
          for (let k = 0; k < 7; k++) {
            const tx = 0.12 + k * 0.12 + hash(k + 3) * 0.04;
            const th = 0.18 + hash(k + 9) * 0.12;
            const top = ground - th;
            if (Math.abs(u - tx) < 0.018 && v > top && v < ground) {
              r = 25;
              g = 55 + (ground - v) * 80;
              b = 30;
            }
            // canopy
            const cd = Math.hypot(u - tx, v - top);
            if (cd < 0.05 + hash(k) * 0.02 && v < ground) {
              r = 20 + hash(k * u * 10) * 30;
              g = 90 + hash(k * v * 10) * 50;
              b = 35;
            }
          }

          // figure near pointer (creature)
          const fd = Math.hypot(u - px, v - py);
          if (fd < 0.05) {
            r = 220;
            g = 160;
            b = 90;
          } else if (fd < 0.09) {
            r = Math.min(255, r + 80);
            g = Math.min(255, g + 40);
          }

          // night vignette
          const vig = Math.hypot(u - 0.5, v - 0.45);
          const dim = Math.max(0.55, 1 - vig * 0.55);
          img.data[i] = Math.min(255, r * dim);
          img.data[i + 1] = Math.min(255, g * dim);
          img.data[i + 2] = Math.min(255, b * dim);
          img.data[i + 3] = 255;
        }
      }
      sctx.putImageData(img, 0, 0);
    };

    const draw = (t: number) => {
      if (!alive) return;
      paintScene(t);
      const { width: w, height: h } = canvas;
      const cols = scene.width;
      const rows = scene.height;
      const cellW = w / cols;
      const cellH = h / rows;
      const data = sctx.getImageData(0, 0, cols, rows).data;

      ctx.fillStyle = "#04060a";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `700 ${Math.floor(cellH * 0.92)}px "IBM Plex Mono", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const idx = Math.min(CHARS.length - 1, Math.floor(L * (CHARS.length - 1)));
          const ch = CHARS[idx];
          if (ch === " ") continue;
          // punch color like living ASCII worlds
          const pr = Math.min(255, Math.floor(r * 1.15));
          const pg = Math.min(255, Math.floor(g * 1.1));
          const pb = Math.min(255, Math.floor(b * 1.05));
          ctx.fillStyle = `rgb(${pr},${pg},${pb})`;
          ctx.fillText(ch, x * cellW + cellW * 0.5, y * cellH + cellH * 0.55);
        }
      }

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
      <div className="glyph-caption">
        <span>04 · GLYPH WORLD</span>
        <strong>сцена из символов · как живой ASCII-мир</strong>
      </div>
    </div>
  );
};
