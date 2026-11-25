import type { FC } from "react";
import { LAB_PROFILE, LAB_WORKS } from "../content";
import "./wax.css";

export const WaxWorld: FC = () => (
  <div className="wax">
    <div className="wax-blob wax-blob-a" aria-hidden />
    <div className="wax-blob wax-blob-b" aria-hidden />
    <header className="wax-top">
      <span className="wax-handle">{LAB_PROFILE.handle}</span>
      <span className="wax-tag">01 · WAXWORLD · CLAY</span>
    </header>
    <main className="wax-main">
      <p className="wax-kicker">soft uncanny · hand-molded UI</p>
      <h1 className="wax-name">{LAB_PROFILE.name}</h1>
      <p className="wax-phrase">{LAB_PROFILE.phrase}</p>
      <ul className="wax-works">
        {LAB_WORKS.map((w) => (
          <li key={w.title}>
            <a
              href={w.href}
              target={w.external ? "_blank" : undefined}
              rel={w.external ? "noreferrer" : undefined}
            >
              <strong>{w.title}</strong>
              <span>{w.text}</span>
            </a>
          </li>
        ))}
      </ul>
      <a className="wax-mail" href={`mailto:${LAB_PROFILE.email}`}>
        {LAB_PROFILE.email}
      </a>
    </main>
  </div>
);
