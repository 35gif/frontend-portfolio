import { useEffect, useState, type FC } from "react";
import { GlyphField } from "./GlyphField";
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
    title: "gifka.pages.dev",
    text: "React-craft витрина: сцена, навигация, атмосфера. Не лендинг из шаблона — пространство.",
    meta: "Craft",
    href: "https://gifka.pages.dev/",
    external: true,
  },
  {
    idx: "02",
    title: "LineDesk",
    text: "Live odds + bet slip. Operator UI под iGaming hiring — таблица рынков и купон.",
    meta: "Demo",
    href: "#/sportsbook",
  },
  {
    idx: "03",
    title: "gifkahub.ru",
    text: "Прод Mini App: кабинет, доступ, admin SPA, Telegram WebApp initData.",
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

const HeroArt: FC = () => (
  <div className="hero-art" aria-hidden>
    <svg viewBox="0 0 800 700" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M120 180c80-90 210-110 320-40 70 45 90 120 40 180-55 70-160 55-210 10-40-35-20-95 35-110 40-12 85 10 95 55"
        stroke="#f0c419"
        strokeWidth="28"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M380 120c40-20 140-10 190 70 55 90 20 190-70 230-95 42-185-20-170-95 12-55 75-70 120-40"
        stroke="#ff3b6b"
        strokeWidth="18"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M90 420c120 20 260 90 340 190"
        stroke="#5cffb0"
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.45"
      />
      <circle cx="560" cy="210" r="54" stroke="#ece6da" strokeWidth="3" opacity="0.25" />
      <path
        d="M640 480c-30 60-110 110-200 120"
        stroke="#f0c419"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.35"
      />
      <text
        x="70"
        y="640"
        fill="#ece6da"
        fillOpacity="0.12"
        fontFamily="Unbounded, sans-serif"
        fontSize="120"
        fontWeight="800"
      >
        JSR
      </text>
    </svg>
  </div>
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

const OddsStrip: FC = () => (
  <a className="board-link" href="#/sportsbook" aria-label="Открыть LineDesk demo">
    <div className="board">
      <div className="board-top">
        <span>LineDesk · sportsbook UI</span>
        <strong>live</strong>
      </div>
      <div className="board-rows">
        {STAGE_ROWS.map((row) => (
          <div className="board-row" key={row.teams}>
            <div>
              <span className="board-league">{row.league}</span>
              <span className="board-teams">{row.teams}</span>
            </div>
            <div className="board-odds">
              {row.odds.map((odd, i) => (
                <span
                  key={`${row.teams}-${odd}`}
                  className={`board-odd${row.hot === i ? " is-hot" : ""}`}
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

const PortfolioHome: FC = () => (
  <div className="page">
    <header className="top">
      <div className="brand">
        35gif <em>/ fe</em>
      </div>
      <nav className="nav">
        <a href="#work">Work</a>
        <a href="#/sportsbook">Sportsbook</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>

    <section className="hero">
      <HeroArt />
      <div className="hero-copy">
        <p className="hero-kicker">React · TypeScript · iGaming FE</p>
        <h1 className="hero-name">Vlad Pashkov</h1>
        <p className="hero-lead">
          Делаю интерфейсы, в которых чувствуется рука: sportsbook UI, кабинеты,
          Mini Apps.
        </p>
        <div className="cta-row">
          <a className="cta" href="#/sportsbook">
            Open demo
          </a>
          <a className="cta cta-ghost" href="https://gifka.pages.dev/" target="_blank" rel="noreferrer">
            Смотреть craft →
          </a>
        </div>
      </div>
    </section>

    <section className="section" id="work">
      <div className="section-head">
        <h2>Работы</h2>
        <p>Три точки входа. Слоты и Pixi — не мой трек.</p>
      </div>
      <div className="works">
        {WORKS.map((item) => (
          <WorkRow key={item.idx} item={item} />
        ))}
      </div>
      <OddsStrip />
    </section>

    <section className="section" id="stack">
      <div className="section-head">
        <h2>Стек</h2>
        <p>Platform FE без лишнего шума.</p>
      </div>
      <div className="stack-line">
        {STACK.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </section>

    <section className="contact" id="contact">
      <h2>Пиши, если ищешь FE</h2>
      <p>Remote / офис. Старт сразу. SoftSwiss, SoftGamings, sportsbook & operator UI.</p>
      <div className="contact-links">
        <a href="mailto:pashkovvlad3@gmail.com">pashkovvlad3@gmail.com</a>
        <a href="https://github.com/35gif" target="_blank" rel="noreferrer">
          github.com/35gif
        </a>
        <a href="https://gifkahub.ru" target="_blank" rel="noreferrer">
          gifkahub.ru
        </a>
        <a href="https://gifka.pages.dev/" target="_blank" rel="noreferrer">
          gifka.pages.dev
        </a>
      </div>
    </section>

    <footer className="footer">© {new Date().getFullYear()} Vlad Pashkov</footer>
  </div>
);

const App: FC = () => {
  const route = useHashRoute();
  if (route.startsWith("/sportsbook")) {
    return (
      <>
        <SportsbookDemo />
        <GlyphField />
      </>
    );
  }
  return (
    <>
      <PortfolioHome />
      <GlyphField />
    </>
  );
};

export default App;
