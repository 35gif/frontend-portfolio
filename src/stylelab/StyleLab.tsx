import { useEffect, useState, type FC } from "react";
import {
  isLabMuted,
  playLabVoice,
  setLabMuted,
  stopLabVoice,
  type LabVoice,
} from "./audio/LabAudio";
import "./lab.css";
import { CaseDesk } from "./samples/CaseDesk";
import { DepthTank } from "./samples/DepthTank";
import { Diorama } from "./samples/Diorama";
import { GlyphMatter } from "./samples/GlyphMatter";
import { WaxWorld } from "./samples/WaxWorld";

type SampleId = 1 | 2 | 3 | 4 | 5;

const CHAMBERS: {
  id: SampleId;
  voice: LabVoice;
  code: string;
  feel: string;
  node: FC;
}[] = [
  { id: 1, voice: "wax", code: "WAX", feel: "Hylics clay", node: WaxWorld },
  { id: 2, voice: "depth", code: "DEPTH", feel: "Abyssal dive", node: DepthTank },
  { id: 3, voice: "case", code: "CASE", feel: "gifka desk", node: CaseDesk },
  { id: 4, voice: "glyph", code: "GLYPH", feel: "Ansenjeo world", node: GlyphMatter },
  { id: 5, voice: "dio", code: "DIORAMA", feel: "2.5D dusk", node: Diorama },
];

function parseLabHash(hash: string): SampleId {
  const m = hash.match(/#\/lab\/(\d)/);
  if (!m) return 1;
  const n = Number(m[1]);
  if (n >= 1 && n <= 5) return n as SampleId;
  return 1;
}

export const StyleLab: FC = () => {
  const [active, setActive] = useState<SampleId>(() =>
    parseLabHash(window.location.hash || "#/lab/1")
  );
  const [muted, setMuted] = useState(true);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const onHash = () => setActive(parseLabHash(window.location.hash || "#/lab/1"));
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash || window.location.hash === "#/" || window.location.hash === "#") {
      window.location.replace("#/lab/1");
    }
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!entered) return;
    const chamber = CHAMBERS.find((c) => c.id === active);
    if (!chamber) return;
    void playLabVoice(chamber.voice);
    return () => stopLabVoice();
  }, [active, entered]);

  const onSelect = (id: SampleId) => {
    window.location.hash = `#/lab/${id}`;
  };

  const onEnter = async () => {
    setEntered(true);
    setMuted(false);
    await setLabMuted(false);
  };

  const onToggleAudio = async () => {
    const next = !isLabMuted();
    await setLabMuted(next);
    setMuted(next);
  };

  const Sample = CHAMBERS.find((s) => s.id === active)?.node ?? WaxWorld;

  return (
    <div className="lab-shell">
      {!entered && (
        <div className="lab-gate">
          <p className="lab-gate-kicker">35gif · visual portrait lab</p>
          <h1 className="lab-gate-title">комнаты вайба</h1>
          <p className="lab-gate-text">
            почти прямой визуал с твоих рефов: Hylics / abyss / gifka / ASCII-world / 2.5D.
            звук procedural. после прохода — keep / mutate / kill.
          </p>
          <div className="lab-gate-actions">
            <button type="button" className="lab-gate-btn" onClick={() => void onEnter()}>
              войти со звуком
            </button>
            <button
              type="button"
              className="lab-gate-btn lab-gate-btn-quiet"
              onClick={() => setEntered(true)}
            >
              без звука
            </button>
          </div>
        </div>
      )}

      {entered && (
        <>
          <nav className="lab-rail" aria-label="Chambers">
            {CHAMBERS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`lab-chamber${active === c.id ? " is-active" : ""}`}
                onClick={() => onSelect(c.id)}
                title={c.feel}
              >
                <span>0{c.id}</span>
                <strong>{c.code}</strong>
                <em>{c.feel}</em>
              </button>
            ))}
            <button type="button" className="lab-audio" onClick={() => void onToggleAudio()}>
              {muted ? "sound off" : "sound on"}
            </button>
          </nav>
          <div className="lab-stage">
            <Sample />
          </div>
        </>
      )}
    </div>
  );
};
