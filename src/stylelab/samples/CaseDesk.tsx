import type { FC } from "react";
import { LAB_PROFILE, LAB_WORKS } from "../content";
import "./case.css";

export const CaseDesk: FC = () => (
  <div className="case">
    <svg className="case-thread" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <path d="M8 12 L42 38 L28 62 L78 48 L92 88" />
    </svg>
    <header className="case-top">
      <span className="case-stamp">CASE 35</span>
      <span>03 · CASE DESK · gifka DNA</span>
    </header>
    <main className="case-main">
      <div className="case-pin" aria-hidden />
      <p className="case-kicker">
        <span className="case-tty">tty1 — root@box</span>
        досье открыто
      </p>
      <h1 className="case-name">{LAB_PROFILE.name}</h1>
      <p className="case-phrase">
        <span className="case-prompt">&gt;</span> {LAB_PROFILE.phrase}
        <span className="case-cursor" aria-hidden>
          █
        </span>
      </p>
      <section className="case-board">
        <h2>улики / работы</h2>
        <div className="case-evidence">
          {LAB_WORKS.map((w, i) => (
            <a
              key={w.title}
              className={`case-card tilt-${(i % 3) + 1}`}
              href={w.href}
              target={w.external ? "_blank" : undefined}
              rel={w.external ? "noreferrer" : undefined}
            >
              <span className="case-idx">0{i + 1}</span>
              <strong>{w.title}</strong>
              <span>{w.text}</span>
            </a>
          ))}
        </div>
      </section>
      <a className="case-mail" href={`mailto:${LAB_PROFILE.email}`}>
        contact::{LAB_PROFILE.email}
      </a>
    </main>
  </div>
);
