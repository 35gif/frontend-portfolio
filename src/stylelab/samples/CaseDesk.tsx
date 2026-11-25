import { useEffect, useRef, useState, type FC } from "react";
import "./case.css";

/** gifka.pages.dev DNA: desk, CASE, thread, terminal, handycam. */

const EVIDENCE = [
  { id: "subj", label: "СУБЪЕКТ", body: "лицо не сходится" },
  { id: "obs", label: "НАБЛЮДАТЕЛЬ", body: "не сталкер. сыщик." },
  { id: "case", label: "CASE 35", body: "досье открыто до твоего визита" },
  { id: "guest", label: "ГОСТЬ", body: "это ты" },
  { id: "cam", label: "КАССЕТА", body: "Handycam пишет вход" },
  { id: "air", label: "ЭФИР", body: "RADIO.EXE молчит" },
];

export const CaseDesk: FC = () => {
  const [active, setActive] = useState(2);
  const [typed, setTyped] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = `> cat README.txt\n${EVIDENCE[active].body}.█`;
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [active]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const onMove = (e: PointerEvent) => {
      const rect = board.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 4;
      board.style.setProperty("--rx", `${-y}deg`);
      board.style.setProperty("--ry", `${x}deg`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="case-room">
      <div className="case-grain" aria-hidden />
      <div className="case-cam" aria-hidden>
        <span>HANDYCAM</span>
        <span>AUTO · 1/60 · F2.0</span>
        <span className="case-rec">● REC</span>
      </div>

      <div className="case-board" ref={boardRef}>
        <div className="case-board-head">
          <span className="case-stamp">CASE 35</span>
          <span>ЛОГОВО · дверь → стол → доска</span>
        </div>

        <svg className="case-thread" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path d="M14 22 L40 36 L34 58 L66 50 L84 76" />
          <circle cx="14" cy="22" r="1.2" />
          <circle cx="40" cy="36" r="1.2" />
          <circle cx="34" cy="58" r="1.2" />
          <circle cx="66" cy="50" r="1.2" />
          <circle cx="84" cy="76" r="1.2" />
        </svg>

        <div className="case-grid">
          {EVIDENCE.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`case-card t${i % 3}${active === i ? " is-on" : ""}`}
              onClick={() => setActive(i)}
            >
              <span className="case-card-pin" />
              <span className="case-card-label">{item.label}</span>
              <strong>{item.body}</strong>
            </button>
          ))}
        </div>

        <div className="case-terminal">
          <div className="case-tty">tty1 — root@box</div>
          <pre className="case-pre">{typed}</pre>
        </div>
      </div>

      <div className="case-caption">
        <span>03 · CASE DESK</span>
        <strong>gifka DNA · досье / нить / terminal</strong>
      </div>
    </div>
  );
};
