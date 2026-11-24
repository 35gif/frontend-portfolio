import { useEffect, useEffectEvent, useState, type FC } from "react";
import "./sportsbook.css";

type Market = {
  id: string;
  league: string;
  home: string;
  away: string;
  kickoff: string;
  odds: [number, number, number];
};

type SlipItem = {
  id: string;
  label: string;
  pick: string;
  odd: number;
};

const MARKETS: Market[] = [
  {
    id: "m1",
    league: "Premier League",
    home: "Arsenal",
    away: "Chelsea",
    kickoff: "19:30",
    odds: [1.92, 3.4, 4.1],
  },
  {
    id: "m2",
    league: "La Liga",
    home: "Real Madrid",
    away: "Sevilla",
    kickoff: "21:00",
    odds: [1.45, 4.2, 6.5],
  },
  {
    id: "m3",
    league: "Serie A",
    home: "Inter",
    away: "Napoli",
    kickoff: "20:45",
    odds: [2.15, 3.25, 3.4],
  },
  {
    id: "m4",
    league: "Bundesliga",
    home: "Dortmund",
    away: "Leipzig",
    kickoff: "18:30",
    odds: [2.05, 3.55, 3.5],
  },
  {
    id: "m5",
    league: "NHL",
    home: "Bruins",
    away: "Rangers",
    kickoff: "01:00",
    odds: [1.85, 3.9, 3.7],
  },
];

const PICKS = ["1", "X", "2"] as const;

const OddsButton: FC<{
  value: number;
  active: boolean;
  onPick: () => void;
  flash: boolean;
}> = ({ value, active, onPick, flash }) => (
  <button
    type="button"
    className={`sb-odd${active ? " is-active" : ""}${flash ? " is-flash" : ""}`}
    onClick={onPick}
  >
    {value.toFixed(2)}
  </button>
);

export const SportsbookDemo: FC = () => {
  const [markets, setMarkets] = useState(MARKETS);
  const [slip, setSlip] = useState<SlipItem[]>([]);
  const [stake, setStake] = useState("20");
  const [flashId, setFlashId] = useState<string | null>(null);
  const [liveTick, setLiveTick] = useState(0);

  const onOddsTick = useEffectEvent(() => {
    let flashed: string | null = null;
    setMarkets((prev) =>
      prev.map((m) => {
        if (Math.random() > 0.45) return m;
        const i = Math.floor(Math.random() * 3);
        const delta = Math.random() > 0.5 ? 0.05 : -0.05;
        const next = [...m.odds] as [number, number, number];
        next[i] = Math.max(1.2, Math.round((next[i] + delta) * 100) / 100);
        flashed = `${m.id}-${i}`;
        return { ...m, odds: next };
      })
    );
    if (flashed) setFlashId(flashed);
    setLiveTick((t) => t + 1);
  });

  useEffect(() => {
    const id = window.setInterval(() => onOddsTick(), 2800);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!flashId) return;
    const t = window.setTimeout(() => setFlashId(null), 500);
    return () => window.clearTimeout(t);
  }, [flashId]);

  const togglePick = (market: Market, pickIdx: number) => {
    const pick = PICKS[pickIdx];
    const id = `${market.id}-${pick}`;
    setSlip((prev) => {
      if (prev.some((x) => x.id === id)) return prev.filter((x) => x.id !== id);
      const withoutSameMatch = prev.filter((x) => !x.id.startsWith(`${market.id}-`));
      return [
        ...withoutSameMatch,
        {
          id,
          label: `${market.home} — ${market.away}`,
          pick: `${pick} · ${market.league}`,
          odd: market.odds[pickIdx],
        },
      ];
    });
  };

  const totalOdd = slip.reduce((acc, item) => acc * item.odd, 1);
  const stakeNum = Number(stake) || 0;
  const payout = stakeNum * totalOdd;

  return (
    <div className="sb">
      <header className="sb-top">
        <a className="sb-back" href="#/">
          ← portfolio
        </a>
        <div className="sb-brand">
          <strong>LineDesk</strong>
          <span>sportsbook UI demo · React/TS</span>
        </div>
        <div className="sb-live" aria-live="polite">
          LIVE · tick {liveTick}
        </div>
      </header>

      <section className="sb-hero">
        <p className="sb-eyebrow">IGAMING · OPERATOR UI</p>
        <h1>Live odds board + bet slip</h1>
        <p>
          Демо platform FE: таблица событий, live-обновление коэффициентов, купон ставки.
          Не слоты — кабинеты и sportsbook UI под iGaming hiring.
        </p>
      </section>

      <div className="sb-layout">
        <section className="sb-board" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 720px" }}>
          <div
            className="sb-table-wrap"
            tabIndex={0}
            role="region"
            aria-labelledby="sb-caption"
          >
            <table className="sb-table">
              <caption id="sb-caption">Live markets</caption>
              <thead>
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">Kickoff</th>
                  <th scope="col">1</th>
                  <th scope="col">X</th>
                  <th scope="col">2</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((m) => (
                  <tr key={m.id}>
                    <th scope="row">
                      <span className="sb-league">{m.league}</span>
                      <span className="sb-match">
                        {m.home} <em>vs</em> {m.away}
                      </span>
                    </th>
                    <td data-label="Kickoff">{m.kickoff}</td>
                    {m.odds.map((odd, i) => (
                      <td key={PICKS[i]} data-label={PICKS[i]}>
                        <OddsButton
                          value={odd}
                          active={slip.some((s) => s.id === `${m.id}-${PICKS[i]}`)}
                          flash={flashId === `${m.id}-${i}`}
                          onPick={() => togglePick(m, i)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="sb-slip" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 420px" }}>
          <h2>Bet slip</h2>
          {slip.length === 0 ? (
            <p className="sb-empty">Выбери исход — купон соберётся здесь.</p>
          ) : (
            <ul className="sb-slip-list">
              {slip.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.pick}</span>
                  </div>
                  <em>{item.odd.toFixed(2)}</em>
                  <button type="button" aria-label="Remove" onClick={() => setSlip((p) => p.filter((x) => x.id !== item.id))}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <label className="sb-stake">
            Stake ($)
            <input
              inputMode="decimal"
              value={stake}
              onChange={(e) => setStake(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </label>

          <div className="sb-totals">
            <div>
              <span>Total odd</span>
              <strong>{slip.length ? totalOdd.toFixed(2) : "—"}</strong>
            </div>
            <div>
              <span>Potential</span>
              <strong>{slip.length ? `$${payout.toFixed(2)}` : "—"}</strong>
            </div>
          </div>

          <button type="button" className="sb-place" disabled={!slip.length || stakeNum <= 0}>
            Place bet (demo)
          </button>
          <p className="sb-note">Mock UI for hiring · no real money · https://35gif.github.io/frontend-portfolio/#/sportsbook</p>
        </aside>
      </div>
    </div>
  );
};
