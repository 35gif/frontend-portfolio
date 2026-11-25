import { useEffect, useRef, type FC } from "react";
import "./diorama.css";

/** Iwaac-adjacent 2.5D: painterly dusk frame, layered parallax illustration. */

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export const Diorama: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.5 };
    let raf = 0;
    let alive = true;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    };
    resize();

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / rect.width;
      pointer.y = (e.clientY - rect.top) / rect.height;
    };

    const strokeCloud = (x: number, y: number, r: number, color: string) => {
      ctx.fillStyle = color;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const rr = r * (0.55 + hash(i + r) * 0.5);
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * r * 0.35, y + Math.sin(a) * r * 0.2, rr, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const draw = (t: number) => {
      if (!alive) return;
      const { width: w, height: h } = canvas;
      const px = (pointer.x - 0.5) * 2;
      const py = (pointer.y - 0.5) * 2;

      // sky wash
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#5a3a52");
      sky.addColorStop(0.35, "#2a1a30");
      sky.addColorStop(0.7, "#15101c");
      sky.addColorStop(1, "#0a0810");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // sun disc + bloom
      const sx = w * (0.7 - px * 0.03);
      const sy = h * (0.2 - py * 0.02);
      const bloom = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.35);
      bloom.addColorStop(0, "rgba(255,200,140,0.9)");
      bloom.addColorStop(0.2, "rgba(232,140,110,0.35)");
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);
      ctx.beginPath();
      ctx.arc(sx, sy, Math.min(w, h) * 0.045, 0, Math.PI * 2);
      ctx.fillStyle = "#ffe2b0";
      ctx.fill();

      // far mountains (back)
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 6) {
        const y =
          h * 0.55 +
          Math.sin(x * 0.0025 + 0.4) * 40 +
          Math.sin(x * 0.008) * 16 -
          px * 12;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      const far = ctx.createLinearGradient(0, h * 0.45, 0, h);
      far.addColorStop(0, "#3a2a40");
      far.addColorStop(1, "#1a1220");
      ctx.fillStyle = far;
      ctx.fill();

      // mid trees silhouettes
      for (let i = 0; i < 16; i++) {
        const x = (i / 16) * w - px * 22;
        const base = h * 0.62 + Math.sin(i) * 10;
        const tall = h * (0.12 + hash(i) * 0.1);
        ctx.fillStyle = `rgba(20, 14, 24, ${0.55 + hash(i) * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(x, base);
        ctx.lineTo(x - 18, base);
        ctx.lineTo(x - 4, base - tall);
        ctx.lineTo(x + 10, base - tall * 0.7);
        ctx.lineTo(x + 16, base);
        ctx.fill();
      }

      // mid ridge
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 5) {
        const y =
          h * 0.68 +
          Math.sin(x * 0.004 + t * 0.0002) * 22 +
          Math.sin(x * 0.012) * 10 -
          px * 28;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = "#120e18";
      ctx.fill();

      // painterly cloud strokes
      strokeCloud(w * 0.25 - px * 10, h * 0.22, h * 0.05, "rgba(232,165,152,0.12)");
      strokeCloud(w * 0.45 - px * 8, h * 0.18, h * 0.04, "rgba(230,194,122,0.1)");

      // foreground figure / rock
      const fx = w * (0.2 - px * 0.05);
      const fy = h * (0.78 - py * 0.02);
      const body = ctx.createLinearGradient(fx, fy - h * 0.2, fx, fy + h * 0.05);
      body.addColorStop(0, "rgba(232,165,152,0.55)");
      body.addColorStop(0.5, "rgba(90,50,70,0.85)");
      body.addColorStop(1, "rgba(20,14,24,0.95)");
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.12) {
        const n = 1 + Math.sin(a * 2.5 + t * 0.001) * 0.08;
        const rx = Math.min(w, h) * 0.11 * n;
        const ry = Math.min(w, h) * 0.18 * n;
        const x = fx + Math.cos(a) * rx;
        const y = fy + Math.sin(a) * ry;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = body;
      ctx.fill();

      // grease-pencil-ish edge
      ctx.strokeStyle = "rgba(244,235,227,0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // film grain hatch
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = "#e8a598";
      for (let i = 0; i < 50; i++) {
        const x0 = hash(i * 1.7) * w;
        ctx.beginPath();
        ctx.moveTo(x0, hash(i * 2.2) * h);
        ctx.lineTo(x0 + 30, hash(i * 2.2) * h + 40);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // vignette
      const vig = ctx.createRadialGradient(w * 0.5, h * 0.45, h * 0.2, w * 0.5, h * 0.5, h * 0.75);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

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
    <div className="dio-room">
      <canvas ref={ref} className="dio-canvas" />
      <div className="dio-caption">
        <span>05 · DIORAMA</span>
        <strong>2.5D кадр · painterly dusk</strong>
      </div>
    </div>
  );
};
