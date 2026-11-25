import { useEffect, useRef, type FC } from "react";
import "./wax.css";

type Blob = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: number;
};

export const WaxWorld: FC = () => {
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
    const blobs: Blob[] = Array.from({ length: 9 }, (_, i) => ({
      x: 0.2 + (i % 3) * 0.25,
      y: 0.25 + Math.floor(i / 3) * 0.22,
      r: 0.08 + (i % 4) * 0.02,
      vx: 0,
      vy: 0,
      hue: 18 + i * 8,
    }));

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

    const draw = (t: number) => {
      if (!alive) return;
      const { width: w, height: h } = canvas;
      ctx.fillStyle = "#e6d3bc";
      ctx.fillRect(0, 0, w, h);

      for (const b of blobs) {
        if (!reduced) {
          const dx = pointer.x - b.x;
          const dy = pointer.y - b.y;
          b.vx += dx * 0.0008;
          b.vy += dy * 0.0008;
          b.vx *= 0.96;
          b.vy *= 0.96;
          b.x += b.vx + Math.sin(t * 0.001 + b.hue) * 0.0004;
          b.y += b.vy + Math.cos(t * 0.0012 + b.hue) * 0.0004;
          b.x = Math.max(0.08, Math.min(0.92, b.x));
          b.y = Math.max(0.1, Math.min(0.9, b.y));
        }
        const cx = b.x * w;
        const cy = b.y * h;
        const rr = b.r * Math.min(w, h) * (1 + Math.sin(t * 0.002 + b.hue) * 0.08);
        const grad = ctx.createRadialGradient(cx - rr * 0.2, cy - rr * 0.25, rr * 0.1, cx, cy, rr);
        grad.addColorStop(0, `hsla(${b.hue}, 42%, 68%, 0.95)`);
        grad.addColorStop(0.55, `hsla(${b.hue + 12}, 35%, 48%, 0.9)`);
        grad.addColorStop(1, `hsla(${b.hue + 30}, 28%, 28%, 0.55)`);
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.2) {
          const wobble = 1 + Math.sin(a * 3 + t * 0.003 + b.hue) * 0.12;
          const x = cx + Math.cos(a) * rr * wobble;
          const y = cy + Math.sin(a) * rr * wobble * 0.92;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.fillStyle = "rgba(42,28,24,0.72)";
      ctx.font = `700 ${Math.floor(Math.min(w, h) * 0.08)}px Fraunces, serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText("WAX", w * 0.07, h * 0.9);
      ctx.font = `500 ${Math.floor(Math.min(w, h) * 0.028)}px "IBM Plex Mono", monospace`;
      ctx.fillStyle = "rgba(90,50,55,0.8)";
      ctx.fillText("мягкая материя · веди пальцем", w * 0.07, h * 0.94);

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
      <p className="wax-sig">35gif / 01</p>
    </div>
  );
};
