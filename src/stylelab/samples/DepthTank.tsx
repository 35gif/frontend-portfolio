import { useEffect, useRef, type FC } from "react";
import "./depth.css";

type Particle = { x: number; y: number; r: number; s: number };

export const DepthTank: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.45 };
    let raf = 0;
    let alive = true;
    const parts: Particle[] = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 2.2,
      s: 0.00015 + Math.random() * 0.00055,
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
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#0a2a3d");
      bg.addColorStop(0.45, "#061722");
      bg.addColorStop(1, "#01060c");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // god rays
      const cx = w * (0.45 + pointer.x * 0.1);
      for (let i = 0; i < 8; i++) {
        const a = -0.4 + i * 0.14 + Math.sin(t * 0.0004 + i) * 0.03;
        ctx.beginPath();
        ctx.moveTo(cx, -h * 0.05);
        ctx.lineTo(cx + Math.cos(a) * h * 1.4, Math.sin(a + 1.15) * h * 1.4);
        ctx.lineTo(cx + Math.cos(a + 0.07) * h * 1.4, Math.sin(a + 1.22) * h * 1.4);
        ctx.closePath();
        const ray = ctx.createLinearGradient(cx, 0, cx, h);
        ray.addColorStop(0, "rgba(120,220,255,0.12)");
        ray.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = ray;
        ctx.fill();
      }

      // kelp silhouettes
      for (let i = 0; i < 12; i++) {
        const baseX = (i / 12) * w;
        ctx.beginPath();
        ctx.moveTo(baseX, h);
        for (let y = h; y > h * 0.2; y -= 12) {
          const sway = Math.sin(t * 0.001 + i + y * 0.01) * 18 + (pointer.x - 0.5) * 20;
          ctx.lineTo(baseX + sway, y);
        }
        ctx.strokeStyle = `rgba(40, 120, 100, ${0.15 + (i % 3) * 0.05})`;
        ctx.lineWidth = 6 + (i % 4);
        ctx.stroke();
      }

      for (const p of parts) {
        if (!reduced) {
          p.y -= p.s;
          p.x += Math.sin(t * 0.001 + p.y * 20) * 0.0003;
          if (p.y < -0.05) {
            p.y = 1.05;
            p.x = Math.random();
          }
        }
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * (devicePixelRatio || 1), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180, 240, 255, 0.35)";
        ctx.fill();
      }

      // depth fog vignette
      const fog = ctx.createRadialGradient(w * 0.5, h * 0.4, h * 0.1, w * 0.5, h * 0.5, h * 0.75);
      fog.addColorStop(0, "rgba(0,0,0,0)");
      fog.addColorStop(1, "rgba(0,5,12,0.72)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "rgba(180,245,255,0.85)";
      ctx.font = `700 ${Math.floor(Math.min(w, h) * 0.07)}px Outfit, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(110,240,255,0.45)";
      ctx.shadowBlur = 24;
      ctx.fillText("DEPTH", w * 0.5, h * 0.48);
      ctx.shadowBlur = 0;
      ctx.font = `500 ${Math.floor(Math.min(w, h) * 0.022)}px "IBM Plex Mono", monospace`;
      ctx.fillStyle = "rgba(150,210,230,0.7)";
      ctx.fillText("погружение · двигай взгляд", w * 0.5, h * 0.55);

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
      <p className="depth-sig">35gif / 02</p>
    </div>
  );
};
