export const profile = {
  user: 'axel',
  handle: 'OrAxelerator',
  email: 'oraxelerator.dev@gmail.com',
};

export const links = {
  github: 'https://github.com/OrAxelerator',
  youtube: 'https://www.youtube.com/@OrAxelerator-dev',
  discord: 'https://discord.gg/hntayYCdwS',
  linktree: 'https://oraxelerator.github.io/portfolio/link-tree/index.html',
};

/** Lignes affichées par `neofetch`, dans l'ordre. */
export const neofetchInfo: ReadonlyArray<[label: string, value: string]> = [
  ['Status', 'Lycéen'],
  ['Level', 'Apprentissage'],
  ['Langages', 'Python / HTML / JS / CSS'],
  ['Uptime', '3 ans de code'],
  ['Projets', 'cd projets'],
  ['LinkTree', 'cd linktree'],
  ['Location', 'France'],
  ['Contact', profile.email],
];
