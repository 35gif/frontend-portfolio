import { useEffect, useRef, type FC } from "react";
import { LAB_PROFILE, LAB_WORKS } from "../content";
import "./diorama.css";

export const Diorama: FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      root.style.setProperty("--px", String(x));
      root.style.setProperty("--py", String(y));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="dio" ref={rootRef}>
      <div className="dio-sky" aria-hidden />
      <div className="dio-mid" aria-hidden />
      <div className="dio-fg" aria-hidden />
      <header className="dio-top">
        <span>{LAB_PROFILE.handle}</span>
        <span>05 · 2.5D DIORAMA · painterly</span>
      </header>
      <main className="dio-main">
        <p className="dio-kicker">illustration-space · parallax frame</p>
        <h1 className="dio-name">{LAB_PROFILE.name}</h1>
        <p className="dio-phrase">{LAB_PROFILE.phrase}</p>
        <nav className="dio-works">
          {LAB_WORKS.map((w) => (
            <a
              key={w.title}
              href={w.href}
              target={w.external ? "_blank" : undefined}
              rel={w.external ? "noreferrer" : undefined}
            >
              {w.title}
            </a>
          ))}
        </nav>
        <a className="dio-mail" href={`mailto:${LAB_PROFILE.email}`}>
          {LAB_PROFILE.email}
        </a>
      </main>
    </div>
  );
};
