import { useEffect, useRef, useState, type FC } from "react";
import "./case.css";

const NOTES = [
  "субъект вошёл сам",
  "нить ведёт к столу",
  "HANDYCAM пишет вход",
  "RADIO.EXE молчит",
  "лицо не сходится",
  "CASE 35 · открыто",
];

export const CaseDesk: FC = () => {
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = NOTES[active];
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 42);
    return () => window.clearInterval(id);
  }, [active]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const onMove = (e: PointerEvent) => {
      const rect = board.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
      board.style.setProperty("--rx", `${-y}deg`);
      board.style.setProperty("--ry", `${x}deg`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="case-room">
      <div className="case-grain" aria-hidden />
      <div className="case-board" ref={boardRef}>
        <svg className="case-thread" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path d="M12 18 L38 34 L30 58 L70 46 L86 78" />
        </svg>
        {NOTES.map((note, i) => (
          <button
            key={note}
            type="button"
            className={`case-pin-note n${i}${active === i ? " is-on" : ""}`}
            onClick={() => setActive(i)}
            style={{ ["--tilt" as string]: `${(i % 2 === 0 ? -1 : 1) * (1.2 + i * 0.4)}deg` }}
          >
            <span className="case-dot" />
            {note}
          </button>
        ))}
        <div className="case-terminal">
          <div className="case-tty">tty1 — root@35gif</div>
          <div className="case-line">
            <span>&gt; </span>
            {typed}
            <span className="case-blink">█</span>
          </div>
        </div>
      </div>
      <p className="case-sig">35gif / 03 · жми улики</p>
    </div>
  );
};
