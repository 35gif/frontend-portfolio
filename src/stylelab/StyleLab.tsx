import { useEffect, useState, type FC } from "react";
import "./lab.css";
import { CaseDesk } from "./samples/CaseDesk";
import { DepthTank } from "./samples/DepthTank";
import { Diorama } from "./samples/Diorama";
import { GlyphMatter } from "./samples/GlyphMatter";
import { WaxWorld } from "./samples/WaxWorld";

type SampleId = 1 | 2 | 3 | 4 | 5;

const SAMPLES: {
  id: SampleId;
  code: string;
  axes: string;
  node: FC;
}[] = [
  { id: 1, code: "WAXWORLD", axes: "CLAY × uncanny", node: WaxWorld },
  { id: 2, code: "DEPTH TANK", axes: "ABYSS × immersion", node: DepthTank },
  { id: 3, code: "CASE DESK", axes: "CASE × gifka", node: CaseDesk },
  { id: 4, code: "GLYPH MATTER", axes: "GLYPH × material", node: GlyphMatter },
  { id: 5, code: "2.5D DIORAMA", axes: "painterly × parallax", node: Diorama },
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

  useEffect(() => {
    const onHash = () => setActive(parseLabHash(window.location.hash || "#/lab/1"));
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash || window.location.hash === "#/" || window.location.hash === "#") {
      window.location.replace("#/lab/1");
    }
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const onSelect = (id: SampleId) => {
    window.location.hash = `#/lab/${id}`;
  };

  const Sample = SAMPLES.find((s) => s.id === active)?.node ?? WaxWorld;

  return (
    <div className="lab-shell">
      <div className="lab-bar">
        <div className="lab-bar-top">
          <div className="lab-title">
            <strong>35gif STYLE LAB</strong> · образцы, не резюме
          </div>
          <div className="lab-note">keep / mutate / kill → потом манифест</div>
        </div>
        <div className="lab-tabs" role="tablist" aria-label="Style samples">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active === s.id}
              className={`lab-tab${active === s.id ? " is-active" : ""}`}
              onClick={() => onSelect(s.id)}
            >
              0{s.id} {s.code}
              <small>{s.axes}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="lab-stage" role="tabpanel">
        <Sample />
      </div>
    </div>
  );
};
