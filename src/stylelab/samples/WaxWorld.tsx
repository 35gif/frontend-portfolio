import { useEffect, useRef, type FC } from "react";
import "./wax.css";

/** Hylics-adjacent: soft plasticine bodies, tactile light, weird organic cast. */

type Body = {
  x: number;
  y: number;
  r: number;
  hue: number;
  stretch: number;
  wobble: number;
};

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export const WaxWorld: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.55, y: 0.5 };
    let raf = 0;
    let alive = true;

    const bodies: Body[] = [
      { x: 0.32, y: 0.55, r: 0.16, hue: 22, stretch: 1.15, wobble: 1.2 },
      { x: 0.58, y: 0.48, r: 0.2, hue: 8, stretch: 0.9, wobble: 0.9 },
      { x: 0.74, y: 0.62, r: 0.11, hue: 340, stretch: 1.3, wobble: 1.6 },
      { x: 0.22, y: 0.36, r: 0.09, hue: 45, stretch: 1.05, wobble: 1.1 },
      { x: 0.68, y: 0.3, r: 0.08, hue: 280, stretch: 0.85, wobble: 0.8 },
    ];

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

    const drawBody = (
      b: Body,
      w: number,
      h: number,
      t: number,
      lightX: number,
      lightY: number
    ) => {
      const cx = b.x * w + Math.sin(t * 0.0008 + b.hue) * 10;
      const cy = b.y * h + Math.cos(t * 0.0007 + b.wobble) * 8;
      const targetX = pointer.x * w;
      const targetY = pointer.y * h;
      const pullX = (targetX - cx) * 0.04;
      const pullY = (targetY - cy) * 0.04;
      const bx = cx + pullX;
      const by = cy + pullY;
      const baseR = b.r * Math.min(w, h);

      // soft contact shadow
      ctx.beginPath();
      ctx.ellipse(bx, by + baseR * 0.75, baseR * 0.85, baseR * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(60,35,30,0.18)";
      ctx.fill();

      const path = new Path2D();
      const steps = 48;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const n =
          1 +
          Math.sin(a * 3 + t * 0.002 * b.wobble + b.hue) * 0.1 +
          Math.sin(a * 5 + t * 0.001) * 0.05;
        const rx = baseR * b.stretch * n;
        const ry = baseR * (2 - b.stretch) * n * 0.95;
        const x = bx + Math.cos(a) * rx + pullX * Math.cos(a) * 0.3;
        const y = by + Math.sin(a) * ry + pullY * Math.sin(a) * 0.3;
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      path.closePath();

      const lx = lightX - bx;
      const ly = lightY - by;
      const len = Math.hypot(lx, ly) || 1;
      const hx = bx - (lx / len) * baseR * 0.25;
      const hy = by - (ly / len) * baseR * 0.25;

      const grad = ctx.createRadialGradient(hx, hy, baseR * 0.05, bx, by, baseR * 1.25);
      grad.addColorStop(0, `hsla(${b.hue}, 55%, 78%, 1)`);
      grad.addColorStop(0.35, `hsla(${b.hue + 8}, 48%, 58%, 1)`);
      grad.addColorStop(0.75, `hsla(${b.hue + 18}, 40%, 38%, 1)`);
      grad.addColorStop(1, `hsla(${b.hue + 25}, 35%, 22%, 0.95)`);
      ctx.fillStyle = grad;
      ctx.fill(path);

      // specular clay highlight
      ctx.beginPath();
      ctx.ellipse(hx - baseR * 0.05, hy - baseR * 0.08, baseR * 0.22, baseR * 0.14, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,245,230,0.45)";
      ctx.fill();

      // crescent / eye mark — Hylics nod
      ctx.beginPath();
      ctx.arc(bx + baseR * 0.15, by - baseR * 0.05, baseR * 0.12, 0.2, Math.PI * 1.6);
      ctx.strokeStyle = "rgba(40,20,18,0.55)";
      ctx.lineWidth = Math.max(2, baseR * 0.04);
      ctx.stroke();
    };

    const draw = (t: number) => {
      if (!alive) return;
      const { width: w, height: h } = canvas;

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#f0ddc4");
      bg.addColorStop(0.5, "#e4c8a8");
      bg.addColorStop(1, "#c9a888");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // dusty floor plane
      ctx.fillStyle = "rgba(120,80,60,0.12)";
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.78, w * 0.42, h * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();

      const lightX = pointer.x * w;
      const lightY = pointer.y * h * 0.85;

      // sort back-to-front
      const sorted = [...bodies].sort((a, b) => a.y - b.y);
      for (const b of sorted) {
        if (!reduced) {
          b.x += (pointer.x - b.x) * 0.004 * b.wobble;
          b.y += (pointer.y * 0.3 + 0.45 - b.y) * 0.003;
        }
        drawBody(b, w, h, t, lightX, lightY);
      }

      // floating crumb particles
      ctx.fillStyle = "rgba(90,50,40,0.35)";
      for (let i = 0; i < 24; i++) {
        const px = hash(i * 3.1) * w;
        const py = ((hash(i * 7.7) + (reduced ? 0 : t * 0.00002 * (i % 5))) % 1) * h;
        ctx.fillRect(px, py, 2, 2);
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
    <div className="wax-room">
      <canvas ref={ref} className="wax-canvas" />
      <div className="wax-caption">
        <span>01 · WAXWORLD</span>
        <strong>пластилин · свет как у Hylics</strong>
      </div>
    </div>
  );
};
