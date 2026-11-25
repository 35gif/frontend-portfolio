export type LabWork = {
  title: string;
  text: string;
  href: string;
  external?: boolean;
};

export const LAB_PROFILE = {
  name: "Vlad Pashkov",
  handle: "35gif",
  phrase: "Frontend, который чувствуется рукой — не шаблоном.",
  email: "pashkovvlad3@gmail.com",
  github: "https://github.com/35gif",
} as const;

export const LAB_WORKS: LabWork[] = [
  {
    title: "gifka.pages.dev",
    text: "React-craft витрина: сцена, атмосфера, пространство.",
    href: "https://gifka.pages.dev/",
    external: true,
  },
  {
    title: "LineDesk",
    text: "Live odds + bet slip. Operator UI demo.",
    href: "#/sportsbook",
  },
  {
    title: "gifkahub.ru",
    text: "Прод Mini App + admin SPA.",
    href: "https://gifkahub.ru",
    external: true,
  },
];
