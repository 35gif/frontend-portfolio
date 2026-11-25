import { useEffect, useRef, type FC } from "react";
import "./diorama.css";

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

    const draw = (t: number) => {
      if (!alive) return;
      const { width: w, height: h } = canvas;
      const px = (pointer.x - 0.5) * 2;
      const py = (pointer.y - 0.5) * 2;

      // sky layer
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#3a2438");
      sky.addColorStop(0.45, "#1b1424");
      sky.addColorStop(1, "#0c0912");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // sun
      const sx = w * (0.72 + px * -0.02);
      const sy = h * (0.22 + py * -0.015);
      const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.18);
      sun.addColorStop(0, "rgba(255, 210, 140, 0.85)");
      sun.addColorStop(0.35, "rgba(232, 150, 120, 0.35)");
      sun.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);

      // mid hills
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) {
        const y =
          h * 0.62 +
          Math.sin(x * 0.004 + t * 0.0003) * 24 +
          Math.sin(x * 0.01) * 12 +
          px * -18;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = "#2a1d33";
      ctx.fill();

      // far ridge
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 10) {
        const y = h * 0.7 + Math.sin(x * 0.003 + 1.2) * 18 + px * -10;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = "#15101c";
      ctx.fill();

      // foreground silhouette form
      const fx = w * (0.18 + px * -0.04);
      const fy = h * (0.78 + py * -0.02);
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.15) {
        const rr = Math.min(w, h) * 0.16 * (1 + Math.sin(a * 2 + t * 0.001) * 0.08);
        const x = fx + Math.cos(a) * rr * 0.7;
        const y = fy + Math.sin(a) * rr;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const body = ctx.createLinearGradient(fx, fy - 80, fx, fy + 80);
      body.addColorStop(0, "rgba(232,165,152,0.35)");
      body.addColorStop(1, "rgba(40,30,50,0.85)");
      ctx.fillStyle = body;
      ctx.fill();

      // painterly strokes overlay
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 40; i++) {
        ctx.strokeStyle = i % 2 ? "#e8a598" : "#e6c27a";
        ctx.beginPath();
        const x0 = (i / 40) * w;
        ctx.moveTo(x0, h * 0.3);
        ctx.quadraticCurveTo(x0 + 40, h * 0.5 + Math.sin(t * 0.001 + i) * 20, x0 - 20, h * 0.75);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = "rgba(244,235,227,0.92)";
      ctx.font = `700 ${Math.floor(Math.min(w, h) * 0.08)}px Literata, Georgia, serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("DIORAMA", w * 0.08, h * 0.28);
      ctx.font = `500 ${Math.floor(Math.min(w, h) * 0.022)}px "IBM Plex Mono", monospace`;
      ctx.fillStyle = "rgba(232,165,152,0.75)";
      ctx.fillText("кадр-иллюстрация · параллакс", w * 0.08, h * 0.34);

      if (!reduced) raf = requestAnimationFrame(draw);
      else {
        // still paint once
      }
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
      <p className="dio-sig">35gif / 05</p>
    </div>
  );
};
