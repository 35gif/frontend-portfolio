import { useEffect, useState, type FC } from "react";
import "./index.css";
import { SportsbookDemo } from "./SportsbookDemo";

type WorkItem = {
  idx: string;
  title: string;
  text: string;
  meta: string;
  href: string;
  external?: boolean;
};

const WORKS: WorkItem[] = [
  {
    idx: "01",
    title: "gifka.pages.dev — React craft",
    text: "Интерактивная витрина на React: сцена, навигация, атмосфера. Показывает UI-мышление без шаблонного лендинга.",
    meta: "Craft",
    href: "https://gifka.pages.dev/",
    external: true,
  },
  {
    idx: "02",
    title: "LineDesk — live odds + bet slip",
    text: "Operator UI: таблица рынков, live-тики коэффициентов, купон ставки. Platform FE под iGaming hiring.",
    meta: "Demo",
    href: "#/sportsbook",
  },
  {
    idx: "03",
    title: "gifkahub.ru — prod Mini App",
    text: "Боевой кабинет в Telegram: доступ, настройки, помощь, auth через WebApp initData. Рядом — admin SPA.",
    meta: "Prod",
    href: "https://gifkahub.ru",
    external: true,
  },
];

const STACK = [
  "React 18/19",
  "TypeScript",
  "Vite",
  "React Router",
  "Telegram Mini Apps",
  "REST / live UI",
];

const STAGE_ROWS = [
  {
    league: "Premier League",
    teams: "Arsenal vs Chelsea",
    odds: ["1.92", "3.40", "4.10"],
    hot: 0,
  },
  {
    league: "La Liga",
    teams: "Real Madrid vs Sevilla",
    odds: ["1.45", "4.20", "6.50"],
    hot: 2,
  },
  {
    league: "Serie A",
    teams: "Inter vs Napoli",
    odds: ["2.15", "3.25", "3.40"],
    hot: 1,
  },
] as const;

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return hash.replace(/^#/, "") || "/";
}

const HeroBoard: FC = () => (
  <a className="stage-link" href="#/sportsbook" aria-label="Открыть LineDesk sportsbook demo">
    <div className="hero-stage">
      <span className="stage-label">LineDesk · sportsbook UI</span>
      <span className="stage-live">Live</span>
      <div className="stage-board">
        {STAGE_ROWS.map((row) => (
          <div className="stage-row" key={row.teams}>
            <div className="stage-match">
              <span className="stage-league">{row.league}</span>
              <span className="stage-teams">{row.teams}</span>
            </div>
            <div className="stage-odds">
              {row.odds.map((odd, i) => (
                <span
                  key={`${row.teams}-${odd}`}
                  className={`stage-odd${row.hot === i ? " is-hot" : ""}`}
                >
                  {odd}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </a>
);

const WorkRow: FC<{ item: WorkItem }> = ({ item }) => (
  <a
    className="work"
    href={item.href}
    target={item.external ? "_blank" : undefined}
    rel={item.external ? "noreferrer" : undefined}
  >
    <span className="work-idx">{item.idx}</span>
    <div className="work-body">
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </div>
    <span className="work-meta">{item.meta}</span>
  </a>
);

const PortfolioHome: FC = () => (
  <div className="page">
    <header className="top">
      <div className="brand">
        35gif <span>/ FE</span>
      </div>
      <nav className="nav">
        <a href="#work">Работы</a>
        <a href="#/sportsbook">Sportsbook</a>
        <a href="#contact">Контакт</a>
      </nav>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <h1 className="hero-name">Vlad Pashkov</h1>
        <p className="hero-headline">Frontend для sportsbook UI и Mini Apps</p>
        <p className="hero-lead">
          React + TypeScript. Live odds, кабинеты, player journeys. Ищу iGaming
          platform / operator FE.
        </p>
        <div className="cta-row">
          <a className="cta" href="#/sportsbook">
            Sportsbook demo
          </a>
          <a className="cta cta-ghost" href="https://gifka.pages.dev/" target="_blank" rel="noreferrer">
            Craft
          </a>
          <a className="cta cta-ghost" href="mailto:pashkovvlad3@gmail.com">
            Написать
          </a>
        </div>
      </div>
      <HeroBoard />
    </section>

    <section className="section" id="work">
      <div className="section-head">
        <h2>Три ссылки для рекрутера</h2>
        <p>Craft, sportsbook demo и прод. Без слотов и Pixi.</p>
      </div>
      <div className="works">
        {WORKS.map((item) => (
          <WorkRow key={item.idx} item={item} />
        ))}
      </div>
    </section>

    <section className="section" id="stack">
      <div className="section-head">
        <h2>Стек</h2>
        <p>Platform FE: React/TS, live UI, REST и Telegram WebApp SDK.</p>
      </div>
      <div className="stack-line">
        {STACK.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </section>

    <section className="contact" id="contact">
      <h2>Открыт к iGaming platform FE</h2>
      <p>Remote / офис обсуждаемо. Старт сразу. SoftSwiss, SoftGamings, sportsbook & operator UI.</p>
      <div className="contact-links">
        <a href="mailto:pashkovvlad3@gmail.com">pashkovvlad3@gmail.com</a>
        <a href="https://github.com/35gif" target="_blank" rel="noreferrer">
          github.com/35gif
        </a>
        <a href="#/sportsbook">#/sportsbook</a>
        <a href="https://gifkahub.ru" target="_blank" rel="noreferrer">
          gifkahub.ru
        </a>
        <a href="https://gifka.pages.dev/" target="_blank" rel="noreferrer">
          gifka.pages.dev
        </a>
      </div>
    </section>

    <footer className="footer">
      © {new Date().getFullYear()} Vlad Pashkov · Frontend React / TypeScript
    </footer>
  </div>
);

const App: FC = () => {
  const route = useHashRoute();
  if (route.startsWith("/sportsbook")) return <SportsbookDemo />;
  return <PortfolioHome />;
};

export default App;
