import { links, profile } from '../data/profile';
import { projects } from '../data/projects';

export type Tone = 'default' | 'muted' | 'accent' | 'error';
export type OutputLine = { text: string; tone?: Tone };

/** Effets de bord que les commandes peuvent déclencher sur la page. */
export type CommandActions = {
  showNeofetch: () => void;
  scrollTo: (id: string) => void;
  openUrl: (url: string, sameTab?: boolean) => void;
};

/** `'clear'` vide l'historique du terminal. */
export type CommandResult = OutputLine[] | 'clear' | void;

type Command = {
  usage: string;
  description: string;
  run: (args: string[], actions: CommandActions) => CommandResult;
};

const line = (text: string, tone?: Tone): OutputLine => ({ text, tone });

const directories: Record<string, (actions: CommandActions) => void> = {
  projets: (a) => a.scrollTo('projets'),
  contact: (a) => a.scrollTo('contact'),
  linktree: (a) => a.openUrl(links.linktree, true),
  youtube: (a) => a.openUrl(links.youtube),
  github: (a) => a.openUrl(links.github),
};
const directoryAliases: Record<string, string> = { 'link-tree': 'linktree', yt: 'youtube' };

function findProject(query: string) {
  const index = Number(query);
  if (Number.isInteger(index)) return projects[index - 1];
  const q = query.toLowerCase();
  return projects.find((p) => p.slug === q || p.name.toLowerCase() === q);
}

const commands: Record<string, Command> = {
  help: {
    usage: 'help',
    description: 'affiche cette aide',
    run: () => [
      line('Commandes disponibles :', 'muted'),
      ...Object.values(commands).map((c) => line(`  ${c.usage.padEnd(16)} ${c.description}`)),
    ],
  },
  ls: {
    usage: 'ls',
    description: 'liste les dossiers',
    run: () => [line(Object.keys(directories).map((d) => `${d}/`).join('  '), 'accent')],
  },
  cd: {
    usage: 'cd <dossier>',
    description: 'va dans un dossier (projets, linktree, yt…)',
    run: ([target = '~'], actions) => {
      const dir = directoryAliases[target] ?? target.replace(/\/$/, '');
      if (dir === '~' || dir === '.') return;
      const go = directories[dir];
      if (!go) return [line(`cd: aucun fichier ou dossier de ce type: ${target}`, 'error')];
      go(actions);
    },
  },
  projets: {
    usage: 'projets',
    description: 'liste les projets',
    run: () => [
      ...projects.map((p, i) => line(`  ${String(i + 1).padStart(2)}  ${p.name.padEnd(16)} ${p.description ?? ''}`.trimEnd())),
      line("Ouvre un projet avec 'open <numéro|nom>'", 'muted'),
    ],
  },
  open: {
    usage: 'open <projet>',
    description: 'ouvre un projet',
    run: (args, actions) => {
      const query = args.join(' ');
      if (!query) return [line('open: précise un projet (ex: open 1)', 'error')];
      const project = findProject(query);
      if (!project) return [line(`open: projet introuvable: ${query}`, 'error')];
      actions.openUrl(project.link);
      return [line(`Ouverture de ${project.name}…`, 'accent')];
    },
  },
  neofetch: {
    usage: 'neofetch',
    description: 'infos système (enfin, sur moi)',
    run: (_args, actions) => actions.showNeofetch(),
  },
  whoami: {
    usage: 'whoami',
    description: 'qui suis-je ?',
    run: () => [line(`${profile.user} — juste un nerd qui fait des vidéos YouTube et qui code.`)],
  },
  echo: {
    usage: 'echo <texte>',
    description: 'répète le texte',
    run: (args) => [line(args.join(' '))],
  },
  clear: {
    usage: 'clear',
    description: 'nettoie le terminal',
    run: () => 'clear',
  },
  sudo: {
    usage: 'sudo <commande>',
    description: 'à tes risques et périls',
    run: (args) =>
      args.join(' ').startsWith('rm -rf')
        ? [line('French Language uninstall 👌🐧', 'accent')]
        : [line(`${profile.user} n'est pas dans le fichier sudoers. Cet incident sera signalé.`, 'error')],
  },
};

export function runCommand(input: string, actions: CommandActions): CommandResult {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return;
  const command = commands[name];
  if (!command) {
    return [line(`zsh: command not found: ${name}`, 'error'), line("Tape 'help' pour voir les commandes.", 'muted')];
  }
  return command.run(args, actions);
}

export const commandNames = Object.keys(commands);
