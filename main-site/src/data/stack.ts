/** Technos affichables sur une carte projet, avec leur icône Font Awesome. */
export const stackMeta = {
  python: { label: 'Python', icon: 'fa-brands fa-python' },
  flask: { label: 'Flask', icon: 'fa-solid fa-flask' },
  js: { label: 'JavaScript', icon: 'fa-brands fa-js' },
  // Font Awesome 6.5 n'a pas d'icône TypeScript.
  ts: { label: 'TypeScript', icon: 'fa-solid fa-code' },
  html5: { label: 'HTML', icon: 'fa-brands fa-html5' },
  css3: { label: 'CSS', icon: 'fa-brands fa-css3-alt' },
  terminal: { label: 'Terminal', icon: 'fa-solid fa-terminal' },
  react: {label: 'React', icon: 'fa-brands fa-react'},
} as const satisfies Record<string, { label: string; icon: string }>;

export type Stack = keyof typeof stackMeta;
