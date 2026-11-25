import { useEffect, useRef, type FC } from "react";
import "./depth.css";

/** Abyssal Garden-adjacent: depth fog, caustics, kelp forest, god rays. */

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export const DepthTank: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.4 };
    let raf = 0;
    let alive = true;

    const bubbles = Array.from({ length: 50 }, (_, i) => ({
      x: hash(i * 2.2),
      y: hash(i * 5.1),
      r: 0.5 + hash(i * 3.3) * 2.8,
      s: 0.00012 + hash(i) * 0.0005,
    }));

    const fish = Array.from({ length: 8 }, (_, i) => ({
      y: 0.25 + hash(i * 4) * 0.45,
      speed: 0.00008 + hash(i * 2) * 0.00015,
      phase: hash(i * 9) * Math.PI * 2,
      size: 0.012 + hash(i) * 0.02,
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

    const caustic = (x: number, y: number, t: number) => {
      const a = Math.sin(x * 0.02 + t * 0.0015) + Math.sin(y * 0.017 - t * 0.0012);
      const b = Math.sin((x + y) * 0.012 + t * 0.001);
      return 0.5 + 0.5 * Math.sin(a + b);
    };

    const draw = (t: number) => {
      if (!alive) return;
      const { width: w, height: h } = canvas;

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#1a5a72");
      bg.addColorStop(0.25, "#0c3550");
      bg.addColorStop(0.6, "#071c30");
      bg.addColorStop(1, "#020910");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // surface shimmer band
      const surface = ctx.createLinearGradient(0, 0, 0, h * 0.2);
      surface.addColorStop(0, "rgba(160,230,255,0.25)");
      surface.addColorStop(1, "rgba(160,230,255,0)");
      ctx.fillStyle = surface;
      ctx.fillRect(0, 0, w, h * 0.22);

      // god rays from pointer-biased sun
      const cx = w * (0.4 + pointer.x * 0.2);
      for (let i = 0; i < 10; i++) {
        const a = -0.55 + i * 0.12 + Math.sin(t * 0.00035 + i) * 0.025;
        ctx.beginPath();
        ctx.moveTo(cx, -h * 0.02);
        ctx.lineTo(cx + Math.cos(a) * h * 1.5, Math.sin(a + 1.15) * h * 1.5);
        ctx.lineTo(cx + Math.cos(a + 0.06) * h * 1.5, Math.sin(a + 1.21) * h * 1.5);
        ctx.closePath();
        const ray = ctx.createLinearGradient(cx, 0, cx, h);
        ray.addColorStop(0, "rgba(140,230,255,0.14)");
        ray.addColorStop(0.55, "rgba(80,170,210,0.04)");
        ray.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = ray;
        ctx.fill();
      }

      // caustics on imaginary floor
      for (let y = h * 0.55; y < h; y += 10) {
        for (let x = 0; x < w; x += 14) {
          const c = caustic(x, y, t);
          if (c < 0.62) continue;
          const alpha = (c - 0.62) * 0.35 * ((y - h * 0.55) / (h * 0.45));
          ctx.fillStyle = `rgba(120, 220, 255, ${alpha})`;
          ctx.fillRect(x, y, 10, 8);
        }
      }

      // kelp forest
      for (let i = 0; i < 18; i++) {
        const baseX = (i / 18) * w + Math.sin(i) * 20;
        const thick = 5 + (i % 5) * 2;
        ctx.beginPath();
        ctx.moveTo(baseX, h + 10);
        for (let y = h; y > h * 0.15; y -= 10) {
          const sway =
            Math.sin(t * 0.001 + i * 0.7 + y * 0.012) * (16 + pointer.x * 10) +
            Math.sin(t * 0.0005 + i) * 8;
          ctx.lineTo(baseX + sway, y);
        }
        ctx.strokeStyle = `rgba(${20 + (i % 4) * 10}, ${90 + (i % 3) * 25}, ${70 + i * 2}, ${0.28 + (i % 3) * 0.08})`;
        ctx.lineWidth = thick;
        ctx.lineCap = "round";
        ctx.stroke();

        // leaf flecks
        for (let k = 0; k < 5; k++) {
          const yy = h * (0.25 + hash(i * 10 + k) * 0.55);
          const sway = Math.sin(t * 0.001 + i + yy * 0.012) * 16;
          ctx.beginPath();
          ctx.ellipse(baseX + sway + 8, yy, thick * 1.8, thick * 0.7, 0.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(60,160,110,0.35)";
          ctx.fill();
        }
      }

      // fish
      for (let i = 0; i < fish.length; i++) {
        const f = fish[i];
        const x = ((hash(i * 3) + (reduced ? 0.3 : t * f.speed)) % 1.2) * w - w * 0.1;
        const y = f.y * h + Math.sin(t * 0.002 + f.phase) * 12;
        const s = f.size * Math.min(w, h);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x - s, y - s * 0.4, x - s * 1.6, y);
        ctx.quadraticCurveTo(x - s, y + s * 0.4, x, y);
        ctx.fillStyle = "rgba(180, 230, 255, 0.35)";
        ctx.fill();
      }

      for (const p of bubbles) {
        if (!reduced) {
          p.y -= p.s;
          p.x += Math.sin(t * 0.001 + p.y * 30) * 0.00025;
          if (p.y < -0.05) {
            p.y = 1.05;
            p.x = hash(p.x * 100 + t);
          }
        }
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * (devicePixelRatio || 1), 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(200, 245, 255, 0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // depth fog
      const fog = ctx.createRadialGradient(w * 0.5, h * 0.35, h * 0.05, w * 0.5, h * 0.55, h * 0.8);
      fog.addColorStop(0, "rgba(0,10,20,0)");
      fog.addColorStop(1, "rgba(0,4,10,0.78)");
      ctx.fillStyle = fog;
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
    <div className="depth-room">
      <canvas ref={ref} className="depth-canvas" />
      <div className="depth-caption">
        <span>02 · DEPTH TANK</span>
        <strong>бездна · caustics / kelp / rays</strong>
      </div>
    </div>
  );
};
