import { useEffect, useEffectEvent, useRef, useState, type FC } from "react";
import { toCanvas } from "html-to-image";

const CHARSET =
  " .'`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

type AsciiOverlayProps = {
  targetId?: string;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function luma(r: number, g: number, b: number) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export const AsciiOverlay: FC<AsciiOverlayProps> = ({ targetId = "app-root" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState(() => !prefersReducedMotion());
  const [ready, setReady] = useState(false);
  const capturing = useRef(false);

  const onToggle = () => setOn((v) => !v);

  const paintFrame = useEffectEvent(async () => {
    if (!on || capturing.current) return;
    const canvas = canvasRef.current;
    const target = document.getElementById(targetId);
    if (!canvas || !target) return;

    capturing.current = true;
    try {
      const shot = await toCanvas(target, {
        pixelRatio: 0.5,
        cacheBust: false,
        backgroundColor: "#ffe600",
        filter: (node) => {
          if (!(node instanceof HTMLElement)) return true;
          return node.dataset.asciiUi !== "1";
        },
      });

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;
      const outW = Math.floor(cssW * dpr);
      const outH = Math.floor(cssH * dpr);
      if (canvas.width !== outW || canvas.height !== outH) {
        canvas.width = outW;
        canvas.height = outH;
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
      }

      const cellW = Math.max(7, Math.round(8 * dpr));
      const cellH = Math.max(10, Math.round(12 * dpr));
      const cols = Math.ceil(outW / cellW);
      const rows = Math.ceil(outH / cellH);

      const sample = document.createElement("canvas");
      sample.width = cols;
      sample.height = rows;
      const sctx = sample.getContext("2d", { willReadFrequently: true })!;
      sctx.imageSmoothingEnabled = true;
      sctx.fillStyle = "#ffe600";
      sctx.fillRect(0, 0, cols, rows);
      // map viewport to page capture (account for scroll)
      const rect = target.getBoundingClientRect();
      const sx = (-rect.left * (shot.width / rect.width));
      const sy = (-rect.top * (shot.height / rect.height));
      const sw = cssW * (shot.width / rect.width);
      const sh = cssH * (shot.height / rect.height);
      sctx.drawImage(shot, sx, sy, sw, sh, 0, 0, cols, rows);
      const data = sctx.getImageData(0, 0, cols, rows).data;

      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, outW, outH);
      ctx.font = `700 ${Math.floor(cellH * 0.86)}px "IBM Plex Mono", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];
          const a = data[i + 3] / 255;
          if (a < 0.08) {
            r = 255;
            g = 230;
            b = 0;
          } else if (a < 1) {
            r = Math.round(r * a + 255 * (1 - a));
            g = Math.round(g * a + 230 * (1 - a));
            b = Math.round(b * a + 0 * (1 - a));
          }
          // JSR punch
          r = Math.min(255, Math.round(r * 1.05));
          g = Math.min(255, Math.round(g * 1.02));
          const L = luma(r, g, b);
          const idx = Math.min(CHARSET.length - 1, Math.floor(L * (CHARSET.length - 1)));
          const ch = CHARSET[idx];
          if (ch === " ") continue;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillText(ch, x * cellW + cellW * 0.5, y * cellH + cellH * 0.55);
        }
      }

      setReady(true);
    } catch {
      // keep last good frame
    } finally {
      capturing.current = false;
    }
  });

  useEffect(() => {
    if (!on) {
      setReady(false);
      return;
    }
    let alive = true;
    let timer = 0;

    const loop = async () => {
      if (!alive) return;
      await paintFrame();
      if (!alive) return;
      timer = window.setTimeout(loop, 160);
    };

    const kick = () => {
      void paintFrame();
    };

    void loop();
    window.addEventListener("resize", kick);
    window.addEventListener("scroll", kick, { passive: true });

    return () => {
      alive = false;
      window.clearTimeout(timer);
      window.removeEventListener("resize", kick);
      window.removeEventListener("scroll", kick);
    };
  }, [on]);

  return (
    <div className="ascii-ui" data-ascii-ui="1">
      <canvas
        ref={canvasRef}
        className={`ascii-canvas${on && ready ? " is-on" : ""}`}
        aria-hidden
      />
      <button
        type="button"
        className={`ascii-toggle${on ? " is-active" : ""}`}
        onClick={onToggle}
        aria-pressed={on}
      >
        {on ? "ASCII ON" : "ASCII OFF"}
      </button>
    </div>
  );
};
