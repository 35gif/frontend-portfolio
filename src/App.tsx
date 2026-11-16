import { useState } from "react";
import "./index.css";

type Tab = "home" | "access" | "help";

const cases = [
  {
    tag: "PRODUCTION · TELEGRAM MINI APP",
    title: "Кабинет внутри Telegram",
    text: "SPA-кабинет: статус доступа, настройки, помощь менеджерам, auth через Telegram WebApp initData.",
    stack: ["React", "TypeScript", "Vite", "TWA SDK", "React Router"],
    href: "https://gifkahub.ru",
  },
  {
    tag: "PRODUCTION · ADMIN SPA",
    title: "Админка сервиса",
    text: "Пользователи, серверы, выдача доступов, аудит, метрики. Формы, фильтры, ролевая навигация.",
    stack: ["React", "TypeScript", "REST", "Vite"],
    href: "https://gifkahub.ru",
  },
  {
    tag: "MOTION",
    title: "Ролики на Remotion",
    text: "Композиции и анимации на React для продуктового контента — тайминг, шрифты, сцены.",
    stack: ["Remotion", "React", "TypeScript"],
    href: "https://github.com/35gif",
  },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <div className="page">
      <header className="top">
        <div className="brand">35gif / frontend</div>
        <nav className="nav">
          <a href="#work">Работы</a>
          <a href="#stack">Стек</a>
          <a href="#contact">Контакт</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">REACT · TYPESCRIPT · MINI APPS</p>
          <h1>Фронтенд для кабинетов и Telegram Mini Apps</h1>
          <p className="lead">
            Владислав Пашков. Собираю продакшен SPA на React + TS: личные кабинеты,
            админки и интерфейсы внутри Telegram — без шаблонной вёрстки «ради портфолио».
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href="mailto:pashkovvlad3@gmail.com">
              Написать на почту
            </a>
            <a className="btn btn-ghost" href="https://github.com/35gif" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="btn btn-ghost" href="https://gifkahub.ru" target="_blank" rel="noreferrer">
              Живое демо
            </a>
          </div>
        </div>

        <div className="phone pulse">
          <div className="phone-inner">
            <div className="tg-bar">
              <span className="tg-title">Mini App · demo</span>
              <span className="pill">online</span>
            </div>
            <div className="screen">
              {tab === "home" && (
                <>
                  <div className="card">
                    <h3>Привет, это кабинет</h3>
                    <p>Статус подписки, быстрые действия, переход в помощь — как в боевом Mini App.</p>
                  </div>
                  <div className="metric-row">
                    <div className="metric">
                      <strong>Active</strong>
                      <span>доступ</span>
                    </div>
                    <div className="metric">
                      <strong>14д</strong>
                      <span>до продления</span>
                    </div>
                  </div>
                  <div className="card">
                    <h3>Следующий шаг</h3>
                    <p>Подключить / продлить / написать менеджеру — один понятный сценарий.</p>
                  </div>
                </>
              )}
              {tab === "access" && (
                <>
                  <div className="card">
                    <h3>Доступ</h3>
                    <p>Ключ / deeplink / инструкция. Копирование + haptic-friendly UX.</p>
                  </div>
                  <div className="card">
                    <h3>Состояние UI</h3>
                    <p>Loading → success → error без «пустых» экранов.</p>
                  </div>
                </>
              )}
              {tab === "help" && (
                <>
                  <div className="card">
                    <h3>Помощь</h3>
                    <p>Список менеджеров, deep-link в чат, ID пользователя для поддержки.</p>
                  </div>
                  <div className="card">
                    <h3>Админ-контур</h3>
                    <p>Отдельно: пользователи, серверы, аудит — тот же React-стек.</p>
                  </div>
                </>
              )}
            </div>
            <div className="tabs">
              {(
                [
                  ["home", "Кабинет"],
                  ["access", "Доступ"],
                  ["help", "Помощь"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`tab${tab === id ? " active" : ""}`}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="work">
        <h2>Что уже в проде</h2>
        <p>Не учебные todo — рабочие интерфейсы. Ниже кейсы и ссылки.</p>
        <div className="grid">
          {cases.map((item) => (
            <a key={item.title} className="case" href={item.href} target="_blank" rel="noreferrer">
              <div className="tag">{item.tag}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="stack">
                {item.stack.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="section" id="stack">
        <h2>Стек</h2>
        <p>То, чем реально закрываю задачи заказчику.</p>
        <div className="skills">
          {[
            "React 18/19",
            "TypeScript",
            "Vite",
            "React Router",
            "Telegram Mini Apps",
            "REST API",
            "адаптив",
            "Remotion",
            "Git",
          ].map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="section" id="contact">
        <div className="contact">
          <div>
            <h2>Нужен React-фронт — напишите</h2>
            <p style={{ color: "var(--muted)", margin: 0 }}>
              Mini App, кабинет, админка или доработка существующего проекта. Remote, старт сразу.
            </p>
          </div>
          <div className="contact-list">
            <a href="mailto:pashkovvlad3@gmail.com">pashkovvlad3@gmail.com</a>
            <a href="https://github.com/35gif" target="_blank" rel="noreferrer">
              github.com/35gif
            </a>
            <a href="https://gifkahub.ru" target="_blank" rel="noreferrer">
              gifkahub.ru — live demo
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">© {new Date().getFullYear()} Vlad Pashkov · Frontend React / TypeScript</footer>
    </div>
  );
}
