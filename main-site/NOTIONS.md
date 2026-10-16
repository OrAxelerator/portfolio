# Les notions utilisées dans le code

Ce fichier explique **chaque notion** utilisée dans le portfolio, avec les vrais bouts de code du projet.
On part du principe que tu connais déjà les bases (`useState`, `useEffect`, JSX, props). Pour la vue d'ensemble, voir [`FONCTIONNEMENT.md`](./FONCTIONNEMENT.md).

De temps en temps, un **🧠 Petit quiz** revient sur ce que tu viens de lire. Essaie de répondre de tête (ou en regardant le code) **avant** d'ouvrir les réponses.

Sommaire :

1. [TypeScript](#1-typescript)
2. [JavaScript moderne](#2-javascript-moderne)
3. [React, un cran plus loin](#3-react-un-cran-plus-loin)
4. [Les patterns d'architecture](#4-les-patterns-darchitecture)
5. [CSS](#5-css)
6. [Accessibilité](#6-accessibilité)
7. [Exercices pour t'approprier le code](#7-exercices)

---

## 1. TypeScript

TypeScript, c'est du JavaScript + des **annotations de types**. Elles disparaissent complètement à la compilation : elles ne servent qu'à ce que l'éditeur et `tsc` détectent les erreurs **avant** que le code tourne (faute de frappe dans une propriété, oubli d'un cas, mauvais argument…).

### 1.1 Les types d'objets et les propriétés optionnelles (`?`)

```ts
// data/projects.ts
export type Project = {
  slug: string;
  name: string;
  description?: string;   // ← le ? = "peut être absent"
  img: string;
  color: string;
  link: string;
  stack: Stack[];         // ← tableau de Stack
};
```

- `type Nom = { ... }` crée un **alias de type** : un nom pour une forme d'objet.
- `description?: string` veut dire que le type réel est `string | undefined`. TypeScript t'oblige donc à gérer le cas où c'est vide :

```tsx
// ProjectCard.tsx — on n'affiche le <p> que si la description existe
{project.description && <p>{project.description}</p>}

// commands.ts — ?? remplace undefined par ''
`${p.description ?? ''}`
```

Si tu oubliais un champ obligatoire (`link`) dans `projects.ts`, `tsc` refuse de compiler. C'est exactement ce qu'on veut.

> `type` vs `interface` : pour décrire des objets, les deux marchent presque pareil. Ici on utilise `type` partout parce qu'il sait aussi faire des unions (section suivante), donc une seule syntaxe à retenir.

### 1.2 Les unions de littéraux

```ts
// commands.ts
export type Tone = 'default' | 'muted' | 'accent' | 'error';
```

`Tone` n'est pas « n'importe quelle string », c'est **une de ces 4 valeurs exactement**. Si tu écris `line('salut', 'erreur')`, TypeScript souligne `'erreur'` en rouge. En plus, l'éditeur te propose les 4 valeurs en autocomplétion.

Une union peut mélanger des types différents :

```ts
export type CommandResult = OutputLine[] | 'clear' | void;
```

« Une commande renvoie soit un tableau de lignes, soit le mot `'clear'`, soit rien du tout. »

**🧠 Petit quiz**

1. Quel est le **vrai** type de `description` dans `Project` ?
2. Que se passe-t-il si tu écris `line('ok', 'succes')` ?

<details>
<summary>Voir les réponses</summary>

1. `string | undefined`. Le `?` ajoute `undefined`.
2. Erreur TypeScript : `'succes'` ne fait pas partie de l'union `Tone`.

</details>

### 1.3 Le *narrowing* (rétrécissement de type)

Quand une variable a un type union, TypeScript **suit tes `if`** pour savoir ce qu'elle contient :

```ts
// Terminal.tsx
const result = runCommand(input, actions);   // result : OutputLine[] | 'clear' | void

if (result === 'clear') {
  setEntries([]);
  return; // on sort
}
// ici TS sait que result : OutputLine[] | void  (plus 'clear')
setEntries((prev) => [...prev, { id: ..., input, output: result ?? [] }]);
//                                                   ↑ void devient [] grâce à ??
```

Pareil dans `runCommand` :

```ts
const command = commands[name];
if (!command) { return [...erreur...]; }
return command.run(args, actions);   // ici command est forcément défini
```

### 1.4 Les types de fonctions et `void`

```ts
export type CommandActions = {
  showNeofetch: () => void;                          // aucun argument, ne renvoie rien
  scrollTo: (id: string) => void;                    // un argument string
  openUrl: (url: string, sameTab?: boolean) => void; // 2e argument optionnel
};

type Command = {
  usage: string;
  description: string;
  run: (args: string[], actions: CommandActions) => CommandResult;
};
```

La syntaxe `(params) => TypeRetour` décrit **la forme d'une fonction**. `void` = « la valeur de retour ne compte pas ».

Grâce au type `Command`, chaque `run` dans l'objet `commands` reçoit automatiquement des paramètres bien typés : dans `run: (args, actions) => ...`, tu n'as rien à annoter, TS sait déjà que `args` est un `string[]`. C'est le **typage contextuel**.

**🧠 Petit quiz**

1. Dans `submit`, après le `if (result === 'clear')`, pourquoi faut-il encore écrire `result ?? []` ?
2. Dans `run: (args, actions) => ...`, pourquoi on n'a pas besoin d'écrire `args: string[]` ?

<details>
<summary>Voir les réponses</summary>

1. Parce que `result` peut encore être `void` (ex : `cd projets` ne renvoie rien), alors que `output` doit être un tableau.
2. <span style="background-color:#fbbfbc">Typage contextuel : `commands` est annoté `Record<string, Command>`, donc TS sait déjà la forme de `run`.</span>

</details>

### 1.5 `Record<K, V>`

```ts
const commands: Record<string, Command> = { help: {...}, ls: {...}, ... };
const directoryAliases: Record<string, string> = { 'link-tree': 'linktree', yt: 'youtube' };
```

`Record<K, V>` = « un objet dont les clés sont de type K et les valeurs de type V ». C'est la façon de typer un **dictionnaire**.

⚠️ **Piège** : avec `Record<string, Command>`, TS considère que `commands['nimportequoi']` est un `Command`, alors qu'en vrai ça vaut `undefined`. C'est pour ça qu'on vérifie toujours :

```ts
const command = commands[name];
if (!command) { ... }        // indispensable, même si TS ne le réclame pas
```

(L'option `noUncheckedIndexedAccess` de `tsconfig` rendrait TS plus strict là-dessus. On ne l'a pas activée pour garder le code simple.)

`<K, V>` entre chevrons, ce sont des **génériques** : des « paramètres de type ». `Record` est un type générique fourni par TS, comme `Array<T>` (= `T[]`).

### 1.6 Le trio `as const` + `satisfies` + `keyof typeof` ⭐

C'est la partie la plus subtile du projet, dans `data/stack.ts` :

```ts
export const stackMeta = {
  python: { label: 'Python', icon: 'fa-brands fa-python' },
  flask:  { label: 'Flask',  icon: 'fa-solid fa-flask' },
  js:     { label: 'JavaScript', icon: 'fa-brands fa-js' },
  // ...
} as const satisfies Record<string, { label: string; icon: string }>;

export type Stack = keyof typeof stackMeta;
```

Le but : **avoir une seule liste** de technos, et que le type `Stack` soit fabriqué automatiquement à partir d'elle. On le lit de droite à gauche :

1. **`typeof stackMeta`** : en position de type, `typeof` récupère **le type d'une variable**. Ici : `{ python: {...}; flask: {...}; js: {...}; ... }`.
2. **`keyof X`** : donne l'union des clés de X. Donc `Stack = 'python' | 'flask' | 'js' | 'ts' | 'html5' | 'css3' | 'terminal'`.
3. **`as const`** : fige l'objet (tout devient `readonly`) et garde les valeurs **exactes** (`'Python'` au lieu de `string`).
4. **`satisfies Record<...>`** : vérifie que l'objet a la bonne forme (chaque entrée a bien un `label` et un `icon`), **sans** effacer les clés précises.

Pourquoi pas juste `const stackMeta: Record<string, {label, icon}> = ...` ? Parce qu'avec une annotation, TS « oublie » les clés exactes : `keyof` donnerait `string`, et on perdrait toute la sécurité. `satisfies` = « vérifie, mais ne change pas le type ».

Résultat concret :

- dans `projects.ts`, `stack: ['pyhton']` → erreur, faute de frappe détectée
- ajouter `rust: {...}` dans `stackMeta` → `'rust'` devient automatiquement un `Stack` valide
- `stackMeta[s].icon` est toujours défini (pas besoin de vérifier `undefined`) car `s` est forcément une clé existante

> Règle à retenir : **les données d'abord, les types dérivés des données**. Pas de liste en double à tenir synchronisée.

**🧠 Petit quiz**

1. Pour TS, quel est le type de `commands['banane']` ? Et en vrai, à l'exécution ?
2. Si on remplace `as const satisfies Record<...>` par une annotation `const stackMeta: Record<string, {...}> = ...`, que devient le type `Stack` ?
3. En une phrase : quelle est la différence entre une annotation `: Type` et `satisfies Type` ?

<details>
<summary>Voir les réponses</summary>

1. Pour TS : `Command`. En vrai : `undefined`. D'où le `if (!command)` obligatoire.
2. `string`. Toutes les fautes de frappe (`'pyhton'`) passeraient sans erreur.
3. L'annotation **remplace** le type de la variable par `Type` ; `satisfies` **vérifie** la compatibilité mais garde le type précis déduit.

</details>

### 1.7 Les tuples et `ReadonlyArray`

```ts
// data/profile.ts
export const neofetchInfo: ReadonlyArray<[label: string, value: string]> = [
  ['Status', 'Lycéen'],
  ['Level', 'Apprentissage'],
  ...
];
```

- `[string, string]` est un **tuple** : un tableau de taille fixe dont chaque position a son type. Ici : toujours 2 éléments.
- `[label: string, value: string]` : les noms sont juste de la documentation (affichés dans l'éditeur).
- `ReadonlyArray<T>` : un tableau qu'on ne peut pas modifier (`push`, `splice`… sont interdits). Pour des données constantes, ça évite qu'un composant les modifie par erreur.

Pourquoi un tableau de tuples et pas un objet comme dans l'ancienne version (`{"Status:": "Lycéen", ...}`) ? Un tableau a un **ordre garanti**, et ça se déstructure bien :

```tsx
neofetchInfo.map(([label, value], i) => ...)
```

### 1.8 Les génériques dans les hooks

```ts
const [filter, setFilter] = useState<Stack | null>(null);
const [entries, setEntries] = useState<Entry[]>([]);
const inputRef = useRef<HTMLInputElement>(null);
const history = useRef<string[]>([]);
```

`useState` devine le type à partir de la valeur de départ. Mais avec `useState(null)`, il déduirait le type `null`, et tu ne pourrais plus jamais y mettre `'python'`. D'où `<Stack | null>` pour lui dire explicitement ce que le state pourra contenir. Pareil pour `[]`, qui serait un tableau de `never` sans précision.

`HTMLInputElement` est le type DOM d'un `<input>`. Grâce à ça, `inputRef.current?.focus()` est autocomplété et vérifié.

**🧠 Petit quiz**

1. Pourquoi `useState<Stack | null>(null)` et pas juste `useState(null)` ?
2. Que fait TS si quelqu'un écrit `neofetchInfo.push(['Age', '17'])` ?

<details>
<summary>Voir les réponses</summary>

1. TS déduirait le type `null` tout seul, et `setFilter('python')` serait refusé.
2. Erreur : `push` n'existe pas sur un `ReadonlyArray`.

</details>

### 1.9 Les types d'événements React

```ts
function submit(e: FormEvent) { e.preventDefault(); ... }
function onKeyDown(e: KeyboardEvent<HTMLInputElement>) { if (e.key === 'Tab') ... }
```

React passe ses propres objets d'événements. Les importer (`import { type FormEvent, type KeyboardEvent } from 'react'`) permet d'avoir `e.key`, `e.ctrlKey`, `e.target`… correctement typés.

Astuce : quand le handler est écrit **directement dans le JSX**, pas besoin de type, c'est déduit tout seul :

```tsx
onChange={(e) => setValue(e.target.value)}   // e est déjà typé
```

### 1.10 Typer les props d'un composant

```tsx
export function ProjectCard({ project }: { project: Project }) { ... }

function FilterChip({ active, onClick, children }:
  { active: boolean; onClick: () => void; children: ReactNode }) { ... }
```

Un composant est une fonction qui reçoit **un seul objet** (les props). On le déstructure directement dans les paramètres et on donne son type après les `:`. Pour des composants plus gros, on sortirait le type : `type FilterChipProps = {...}`.

`ReactNode` = « n'importe quoi que React sait afficher » : texte, nombre, JSX, tableau, `null`… C'est le bon type pour `children`.

### 1.11 `import type` et `verbatimModuleSyntax`

```ts
import { useState, type ReactNode } from 'react';
import type { Project } from '../data/projects';
```

Le mot `type` dit : « cet import ne sert qu'aux types, supprime-le du JS final ». L'option `verbatimModuleSyntax` du `tsconfig.json` **oblige** à le préciser. Ça rend évident, en lisant le fichier, ce qui existe vraiment à l'exécution et ce qui n'existe que pour TS.

**🧠 Petit quiz**

1. Pourquoi `onChange={(e) => ...}` n'a pas besoin de type, alors que `function submit(e: FormEvent)` en a besoin ?
2. Que se passe-t-il si tu écris `import { Project } from '../data/projects'` (sans `type`) ?

<details>
<summary>Voir les réponses</summary>

1. Écrit directement dans le JSX, TS connaît le contexte (`onChange` d'un `<input>`). Une fonction déclarée à part ne sait pas où elle sera utilisée.
2. Erreur, à cause de `verbatimModuleSyntax` : `Project` n'existe pas en JS, il faut `import type`.

</details>

### 1.12 Les assertions : `!` et `as`

```ts
// main.tsx
createRoot(document.getElementById('root')!)
```

`getElementById` renvoie `HTMLElement | null`. Le `!` dit à TS : « fais-moi confiance, ce n'est pas null » (on sait que `#root` existe dans `index.html`). À utiliser **rarement** : si tu te trompes, ça plante à l'exécution sans que TS ait prévenu.

```tsx
// ProjectCard.tsx
style={{ '--project-color': project.color } as CSSProperties}
```

Le type `CSSProperties` de React ne connaît pas les variables CSS (`--truc`), donc TS refuse. `as CSSProperties` force le type. Même règle : `as` désactive une vérification, c'est un dernier recours quand tu sais quelque chose que TS ne sait pas.

### 1.13 Importer des images et du CSS

```ts
import meImg from '../../../assets/me.png';     // meImg : string (une URL)
import styles from './Terminal.module.css';      // styles : { [classe: string]: string }
```

TypeScript ne sait pas nativement ce qu'est un import de `.png`. C'est `"types": ["vite/client"]` dans `tsconfig.json` qui le lui apprend. À la compilation, Vite copie l'image dans `dist/assets/` et `meImg` contient son URL finale.

### 1.14 Ce que fait `tsconfig.json`

Les options qui comptent :

| Option                                  | Effet                                                                                         |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `strict: true`                          | active toutes les vérifications importantes (notamment `null`/`undefined` doivent être gérés) |
| `noUnusedLocals` / `noUnusedParameters` | erreur si une variable ou un paramètre ne sert à rien                                         |
| `jsx: "react-jsx"`                      | comprend le JSX, sans avoir besoin d'`import React` dans chaque fichier                       |
| `noEmit: true`                          | TS vérifie seulement, il ne génère aucun fichier (c'est Vite qui compile)                     |
| `moduleResolution: "bundler"`           | résout les imports comme le fait Vite                                                         |

D'ailleurs, à cause de `noUnusedParameters`, la commande `neofetch` écrit `_args` :

```ts
run: (_args, actions) => actions.showNeofetch(),
```

Le `_` signifie « paramètre volontairement ignoré » (on a besoin du 2e, donc on doit écrire le 1er).

**🧠 Petit quiz**

1. Quelle est la différence de risque entre `document.getElementById('root')!` et `document.getElementById('root')?.focus()` ?
2. Pourquoi la commande `neofetch` écrit `_args` et pas `args` ?
3. Quel type a `meImg` dans `import meImg from '../../../assets/me.png'`, et qui l'apprend à TS ?

<details>
<summary>Voir les réponses</summary>

1. `!` dit juste à TS « pas null » sans rien vérifier : si c'est faux, ça plante. `?.` vérifie vraiment à l'exécution et s'arrête proprement.
2. `noUnusedParameters` râlerait sur un paramètre inutilisé. Le `_` indique qu'on l'ignore volontairement (on doit l'écrire pour accéder au 2e).
3. `string` (l'URL de l'image), grâce à `"types": ["vite/client"]` dans `tsconfig.json`.

</details>

---

## 2. JavaScript moderne

### 2.1 La déstructuration

```ts
// tableau + "rest" : le premier élément, puis tout le reste dans un tableau
const [name, ...args] = input.trim().split(/\s+/);
// "open 2"  →  name = "open", args = ["2"]
// "sudo rm -rf" → name = "sudo", args = ["rm", "-rf"]

// dans les paramètres, avec valeur par défaut
run: ([target = '~'], actions) => { ... }
// cd       → args = []          → target = '~'
// cd yt    → args = ['yt']      → target = 'yt'

// objet
const { project } = props;           // équivaut à : function X({ project })
```

### 2.2 Le spread `...`

```ts
setEntries((prev) => [...prev, nouvelleEntree]);   // nouveau tableau = ancien + 1 élément

run: () => [
  line('Commandes disponibles :', 'muted'),
  ...Object.values(commands).map(...)              // "étale" un tableau dans un autre
]
```

En React, on ne modifie **jamais** un state directement (`prev.push(x)` ❌). On crée une copie modifiée : React compare les références pour savoir si quelque chose a changé.

### 2.3 `?.` et `??`

```ts
inputRef.current?.focus();
// si current est null/undefined → s'arrête, ne plante pas. Sinon appelle focus()

document.getElementById(id)?.scrollIntoView(...)

directoryAliases[target] ?? target
// si à gauche c'est null/undefined → prend la droite
```

`??` vs `||` : `||` remplace aussi `0`, `''` et `false`. `??` ne remplace **que** `null`/`undefined`. Exemple : `0 || 5` = `5`, mais `0 ?? 5` = `0`. On utilise `??` quand `0` ou `''` sont des valeurs valides.

**🧠 Petit quiz**

1. Que valent `name` et `args` dans `const [name, ...args] = 'cd'.split(/\s+/)` ? Et `target` dans la commande `cd` ?
2. Que valent `'' || 'vide'` et `'' ?? 'vide'` ?
3. Pourquoi ne pas écrire `setEntries((prev) => { prev.push(e); return prev; })` ?

<details>
<summary>Voir les réponses</summary>

1. `name = 'cd'`, `args = []`. Dans `run: ([target = '~'])`, le tableau est vide donc `target = '~'`.
2. `'vide'` puis `''`. `??` ne remplace que `null`/`undefined`.
3. C'est le **même** tableau (même référence) : React croit que rien n'a changé et peut ne pas re-rendre.

</details>

### 2.4 Fonctions fléchées qui renvoient un objet

```ts
const line = (text: string, tone?: Tone): OutputLine => ({ text, tone });
```

Les parenthèses autour de `{ }` sont obligatoires, sinon JS croit que c'est le corps de la fonction. `{ text, tone }` est le raccourci de `{ text: text, tone: tone }`.

### 2.5 Les méthodes de tableaux et de strings utilisées

```ts
// Set = collection sans doublons. On le reconvertit en tableau avec [...]
const usedStacks = [...new Set(projects.flatMap((p) => p.stack))];
// flatMap = map puis "aplatit" d'un niveau :
// [['python','terminal'], ['js','html5']] → ['python','terminal','js','html5']

Object.keys(directories)       // ['projets', 'contact', 'linktree', ...]
Object.values(commands)        // [{usage:'help',...}, {usage:'ls',...}, ...]

'open'.padEnd(16)              // 'open            '  (complète avec des espaces → colonnes alignées)
String(3).padStart(2)          // ' 3'
'cd projets/'.replace(/\/$/, '')   // regex : enlève un "/" à la fin → 'cd projets'
input.split(/\s+/)             // découpe sur 1 ou plusieurs espaces
args.join(' ')                 // ['rm','-rf'] → 'rm -rf'
'help'.startsWith('he')        // true (utilisé pour la complétion Tab)
```

```ts
function findProject(query: string) {
  const index = Number(query);              // "2" → 2, "pixel" → NaN
  if (Number.isInteger(index)) return projects[index - 1];
  ...
}
```

### 2.6 Les closures

```ts
// Terminal.tsx
const actions: CommandActions = {
  showNeofetch: () => setNeofetchKey((k) => k + 1),
  ...
};
```

Ces petites fonctions « se souviennent » de `setNeofetchKey`, qui existe dans `Terminal`. Quand `commands.ts` appelle `actions.showNeofetch()`, il déclenche sans le savoir un `setState` dans un composant React. C'est une **closure** : une fonction qui emporte avec elle les variables de l'endroit où elle a été créée.

**🧠 Petit quiz**

1. Que renvoie `const f = () => { text: 'a' }` ?
2. Que vaut `[...new Set(['js', 'python', 'js'])]` ?
3. `Number('')` vaut `0`, qui est un entier. Pourquoi `open` (sans argument) n'ouvre pas `projects[-1]` ?

<details>
<summary>Voir les réponses</summary>

1. `undefined` ! Les `{ }` sont lues comme le corps de la fonction (et `text:` comme une étiquette). Il faut `() => ({ text: 'a' })`.
2. `['js', 'python']`
3. Parce que `open.run` vérifie `if (!query)` **avant** d'appeler `findProject`.

</details>

---

## 3. React, un cran plus loin

### 3.1 `useRef` : les deux usages ⭐

`useRef` donne une « boîte » `{ current: ... }` qui **persiste entre les rendus**, et dont la modification **ne déclenche pas** de nouveau rendu.

**Usage 1 : accéder à un élément du DOM**

```tsx
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} ... />
inputRef.current?.focus();      // après le rendu, current = le vrai <input>
```

C'est la version React de `document.getElementById('terminalInput')`.

**Usage 2 : une variable qui survit mais n'est pas affichée**

```ts
const history = useRef<string[]>([]);    // commandes tapées (pour ↑/↓)
const historyIndex = useRef(0);          // où on en est dans l'historique
const nextId = useRef(0);                // compteur pour les key
```

Pourquoi pas `useState` ? Parce que **rien à l'écran ne dépend directement d'eux**. Les mettre en state provoquerait des re-rendus inutiles. Et pourquoi pas une simple variable `let` ? Parce qu'elle serait remise à zéro à chaque rendu (la fonction du composant est ré-exécutée).

|                           | survit aux rendus | modifier → re-rendu | à utiliser pour                     |
| ------------------------- | ----------------- | ------------------- | ----------------------------------- |
| `let x` dans le composant | ❌                 | ❌                   | calculs temporaires                 |
| `useState`                | ✅                 | ✅                   | ce qui s'affiche                    |
| `useRef`                  | ✅                 | ❌                   | DOM, compteurs, historique, timers… |

### 3.2 Le `setState` fonctionnel

```ts
setEntries((prev) => [...prev, entree]);
setNeofetchKey((k) => k + 1);
```

Au lieu de passer la nouvelle valeur, on passe **une fonction qui reçoit l'ancienne**. Ça garantit de partir de la valeur la plus à jour. C'est indispensable dans `actions.showNeofetch`, qui est une closure (2.6) : la valeur de `neofetchKey` qu'elle « voit » pourrait être périmée, alors que `k` dans `(k) => k + 1` est toujours la vraie valeur actuelle.

Règle simple : **si la nouvelle valeur dépend de l'ancienne, utilise la forme fonction.**

**🧠 Petit quiz**

1. Si `history` était un `useState`, qu'est-ce qui changerait ? Et si c'était un simple `let history = []` ?
2. Dans `actions`, pourquoi `setNeofetchKey((k) => k + 1)` et pas `setNeofetchKey(neofetchKey + 1)` ?

<details>
<summary>Voir les réponses</summary>

1. `useState` : un re-rendu inutile à chaque commande. `let` : le tableau serait recréé vide à chaque rendu, l'historique serait perdu.
2. La closure pourrait « voir » une ancienne valeur de `neofetchKey`. La forme fonction reçoit toujours la valeur actuelle.

</details>

### 3.3 L'input contrôlé

```tsx
const [value, setValue] = useState('');
<input value={value} onChange={(e) => setValue(e.target.value)} />
```

C'est React qui décide de ce qu'affiche l'input (via `value`), et non le navigateur. Avantage : on peut le modifier par le code, ce que font l'historique (`setValue(h[i])`), la complétion Tab (`setValue('help ')`) et le vidage après Entrée (`setValue('')`).

L'ancienne version utilisait un `<span contenteditable>`, plus difficile à contrôler (et on récupérait du HTML au lieu de texte).

### 3.4 `useEffect` et ses dépendances

```ts
useEffect(() => {
  if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus({ preventScroll: true });
}, []);                 // [] = une seule fois, après le premier affichage

useEffect(() => {
  inputRef.current?.scrollIntoView({ block: 'nearest' });
}, [entries]);          // à chaque fois que entries change
```

- `matchMedia('(pointer: fine)')` = « l'utilisateur a une souris ». Sur téléphone, on ne focus pas, sinon le clavier s'ouvrirait direct.
- Le 2e effet garde l'input visible quand de nouvelles lignes s'ajoutent.

> En mode dev, `<StrictMode>` (dans `main.tsx`) exécute volontairement les effets **deux fois** au montage, pour révéler les effets mal écrits. C'est normal et ça n'arrive pas en production.

### 3.5 La prop `key` : deux usages

**Dans les listes**, `key` permet à React de savoir quel élément est lequel entre deux rendus :

```tsx
{visible.map((project) => <li key={project.slug}>...</li>)}
{entries.map((entry) => <div key={entry.id}>...</div>)}
```

On utilise un identifiant **stable et unique** (`slug`, `id`). L'index du tableau est une mauvaise key si la liste peut être filtrée ou réordonnée (React mélangerait les éléments). Ici, `key={i}` est quand même utilisé pour les lignes d'output d'une commande, parce que ces lignes ne changent jamais une fois créées.

C'est pour ça que `nextId` existe : donner un id unique à chaque entrée du terminal, même si on tape deux fois la même commande.

**Pour forcer un composant à repartir de zéro :**

```tsx
<Neofetch key={neofetchKey} />
```

Si la `key` change, React considère que c'est un **autre** composant : il démonte l'ancien et en monte un neuf, donc les animations d'apparition se rejouent. C'est le moyen idiomatique de « réinitialiser » un composant.

**🧠 Petit quiz**

1. Que se passe-t-il si on garde `value={value}` sur l'input mais qu'on supprime `onChange` ?
2. Et un `useEffect` **sans** tableau de dépendances ?
3. Pourquoi `key={i}` serait une mauvaise idée pour les cartes projets ?
4. Que se passe-t-il quand `neofetchKey` passe de 2 à 3 ?

<details>
<summary>Voir les réponses</summary>

1. L'input est bloqué : on tape, mais React remet toujours `value` (qui ne change jamais). React affiche aussi un warning.
2. Il s'exécute après **chaque** rendu.
3. Le filtre change les index : React associerait les mauvaises cartes entre deux rendus.
4. React démonte l'ancien `<Neofetch>` et en monte un neuf : les animations se rejouent.

</details>

### 3.6 L'état dérivé : ne pas tout mettre en state

```tsx
const [filter, setFilter] = useState<Stack | null>(null);
const visible = filter ? projects.filter((p) => p.stack.includes(filter)) : projects;
```

`visible` se **calcule** à partir de `filter`, donc ce n'est pas un state. Si on avait aussi fait `const [visible, setVisible] = useState(...)`, il faudrait penser à le mettre à jour à chaque changement de filtre, avec le risque d'oublier et d'avoir deux states qui se contredisent.

> Règle : **un state = la plus petite information qui ne peut pas être calculée à partir d'autre chose.**

### 3.7 Le rendu conditionnel et le piège du `0`

```tsx
{project.description && <p>...</p>}
{project.stack.length > 0 && <ul>...</ul>}
```

`a && b` renvoie `a` si `a` est « faux », sinon `b`. React n'affiche rien pour `undefined`, `null`, `false` et `''`… **mais il affiche `0`**. Si on écrivait `{project.stack.length && <ul>}`, une stack vide afficherait un « 0 » sur la carte. D'où le `> 0` qui produit un vrai booléen.

### 3.8 `children` et les petits composants

```tsx
<FilterChip active={filter === stack} onClick={() => setFilter(stack)}>
  <i className={...} /> {stackMeta[stack].label}      ← ceci devient children
</FilterChip>
```

Ce qu'on met **entre** les balises d'un composant arrive dans la prop `children`. `FilterChip` gère l'apparence du bouton, l'appelant décide du contenu.

`FilterChip` est déclaré dans le même fichier que `Projects` parce qu'il ne sert qu'à lui. `SectionTitle` a son propre fichier parce qu'il est utilisé par `Projects` **et** `Contact`.

**🧠 Petit quiz**

1. Qu'afficherait `{project.stack.length && <ul>...</ul>}` pour OrA.studio (stack vide) ?
2. Pourquoi `visible` n'est pas un state dans `Projects` ?

<details>
<summary>Voir les réponses</summary>

1. Un `0` tout seul sur la carte.
2. On peut le calculer à partir de `filter`. Le stocker en plus créerait deux states à synchroniser.

</details>

### 3.9 Les Fragments `<>...</>`

```tsx
// App.tsx
return (
  <>
    <Header />
    <main>...</main>
    <footer>...</footer>
  </>
);
```

Un composant doit renvoyer **un seul** élément racine. `<>` permet de regrouper sans ajouter de `<div>` inutile dans le DOM.

### 3.10 Où déclarer les constantes ?

```ts
// En dehors du composant : calculé UNE fois, au chargement du fichier
const usedStacks = [...new Set(projects.flatMap((p) => p.stack))];
const PROMPT = '~/portfolio$';
const title = `${profile.user}@${profile.handle}`;

export function Projects() {
  // Dans le composant : recalculé à CHAQUE rendu
  const visible = filter ? ... : projects;
}
```

Si une valeur ne dépend ni des props ni du state, mets-la hors du composant.

### 3.11 Événements : `preventDefault` et propagation

```ts
e.preventDefault();
```

Ça annule le comportement par défaut du navigateur :

- `submit` d'un `<form>` → sinon la page se recharge
- `Tab` → sinon le focus part sur l'élément suivant
- `↑` / `↓` → sinon le curseur saute au début/à la fin de l'input

```tsx
<section onClick={() => inputRef.current?.focus()}>
```

Un clic n'importe où dans la fenêtre du terminal « remonte » (*bubbling*) jusqu'à la `<section>`, qui redonne le focus à l'input. Ça imite un vrai terminal.

Pourquoi un `<form>` plutôt que d'écouter `Enter` dans `onKeyDown` comme l'ancienne version ? C'est le comportement standard : Entrée sur ordinateur, bouton « Envoyer » du clavier mobile (`enterKeyHint="send"`), lecteurs d'écran… tout déclenche `onSubmit`.

**🧠 Petit quiz**

1. Pourquoi `usedStacks` est déclaré **en dehors** de `Projects` ?
2. Que se passerait-il sans `e.preventDefault()` dans `submit` ?
3. Pourquoi un clic n'importe où dans la fenêtre du terminal met le focus dans l'input ?

<details>
<summary>Voir les réponses</summary>

1. Il ne dépend ni des props ni du state : inutile de le recalculer à chaque rendu.
2. Le formulaire serait envoyé : la page se rechargerait et l'historique du terminal serait perdu.
3. Le clic « remonte » (*bubbling*) jusqu'au `onClick` de la `<section>`, qui appelle `inputRef.current?.focus()`.

</details>

---

## 4. Les patterns d'architecture

C'est cette partie qui fait la différence entre « du code qui marche » et « du code facile à faire évoluer ».

### 4.1 La table de dispatch (*data-driven*)

Au lieu de :

```ts
if (name === 'help') { ... }
else if (name === 'ls') { ... }
else if (name === 'cd') { ... }
// ...
```

on a un **objet** dont les clés sont les noms de commandes :

```ts
const commands: Record<string, Command> = {
  help: { usage, description, run },
  ls:   { usage, description, run },
  ...
};

const command = commands[name];   // recherche directe, pas de boucle
```

Avantages :

- ajouter une commande = ajouter une entrée, sans toucher au reste
- la liste des commandes devient une **donnée** qu'on peut parcourir : `help` affiche toutes les commandes et la complétion Tab utilise `commandNames`, **automatiquement**
- le type `Command` garantit que chaque commande a bien une `usage`, une `description` et un `run`

Même idée pour `directories` (les cibles de `cd`) et `stackMeta` (les icônes). Dans l'ancien code, l'icône était choisie avec des `if` (qui avaient d'ailleurs un bug pour Flask).

### 4.2 L'injection de dépendances (`CommandActions`) ⭐

C'est le « type qui a des actions » dont tu parlais.

**Le problème :** certaines commandes doivent agir sur la page (scroller, ouvrir un lien, relancer neofetch). Mais on ne veut pas que `commands.ts` importe React ou touche au DOM n'importe comment.

**La solution :** `commands.ts` déclare **ce dont il a besoin**, sous forme de type :

```ts
export type CommandActions = {
  showNeofetch: () => void;
  scrollTo: (id: string) => void;
  openUrl: (url: string, sameTab?: boolean) => void;
};
```

et le composant qui l'utilise **fournit** l'implémentation :

```ts
// Terminal.tsx
const actions: CommandActions = {
  showNeofetch: () => setNeofetchKey((k) => k + 1),
  scrollTo: (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
  openUrl: (url, sameTab) => (sameTab ? window.location.assign(url) : window.open(url, '_blank', 'noopener')),
};

runCommand(input, actions);   // on "injecte" les actions
```

Une analogie : `commands.ts` est un chef qui dit « j'ai besoin d'un four et d'un couteau », sans se soucier de leur marque. `Terminal` lui fournit le four et le couteau.

Ce que ça apporte :

- `commands.ts` est **indépendant** : il ne dépend que de types et de données

- on peut **tester** les commandes sans navigateur, en injectant de fausses actions :

  ```ts
  const fausses = { showNeofetch() {}, scrollTo(id) { console.log('scroll', id) }, openUrl() {} };
  runCommand('cd projets', fausses);   // affiche "scroll projets"
  ```

- si demain tu veux un vrai routeur au lieu du scroll, tu changes `actions` dans `Terminal`, et `commands.ts` ne bouge pas

**🧠 Petit quiz**

1. Pour ajouter une commande `date`, combien d'endroits faut-il modifier ? Pourquoi `help` et la complétion Tab suivent-elles toutes seules ?
2. Tu ajoutes `copyEmail: () => void` au type `CommandActions` sans toucher à `Terminal.tsx`. Que se passe-t-il ?
3. Pourquoi `commands.ts` n'appelle pas directement `document.getElementById(...)` ?

<details>
<summary>Voir les réponses</summary>

1. Un seul : l'objet `commands`. `help` parcourt `Object.values(commands)` et Tab utilise `commandNames = Object.keys(commands)`.
2. Erreur TS dans `Terminal.tsx` : l'objet `actions` ne respecte plus le type, il manque `copyEmail`.
3. Pour rester indépendant du navigateur et de React : testable avec de fausses actions, et on peut changer l'implémentation sans le toucher.

</details>

### 4.3 Les fonctions pures

`runCommand`, `findProject` et `line` sont (presque) **pures** : même entrée → même sortie, sans rien modifier à l'extérieur. Les effets de bord passent uniquement par `actions`. Le code pur est le plus simple à comprendre et à tester. Une bonne habitude : pousser la logique dans des fonctions pures, et garder les composants pour l'affichage et le branchement.

### 4.4 Une seule source de vérité

Chaque information n'est écrite **qu'à un endroit** :

- la liste des projets → `projects.ts` (utilisée par la grille, les filtres, `projets`, `open`)
- l'email → `profile.email` (utilisé par le neofetch, `Contact`)
- les technos → `stackMeta` (le type `Stack` en est dérivé)
- les couleurs → les variables CSS de `global.css`

Si tu te retrouves à copier-coller une valeur, c'est souvent le signe qu'il faut la centraliser.

**🧠 Petit quiz**

1. Ton adresse mail change. Combien de fichiers modifier ?
2. `findProject` est-elle une fonction pure ?

<details>
<summary>Voir les réponses</summary>

1. Un seul : `profile.email` dans `data/profile.ts` (le neofetch et Contact l'utilisent).
2. Oui : elle lit `projects` (constant), ne modifie rien, et renvoie toujours le même résultat pour la même entrée.

</details>

---

## 5. CSS

### 5.1 CSS Modules

```tsx
import styles from './ProjectCard.module.css';
<a className={styles.card}>
```

Le suffixe `.module.css` dit à Vite de rendre les classes **locales** : `.card` devient un nom unique genre `_card_1x9ab`. Plus de conflit entre composants, et on voit tout de suite quel CSS va avec quel composant.

Plusieurs classes :

```tsx
className={`${styles.line} ${styles.hint}`}
```

Classe choisie dynamiquement :

```tsx
className={`${styles.line} ${styles[out.tone ?? 'default']}`}
// tone = 'error' → styles.error → la classe .error du fichier
```

Les noms de `Tone` correspondent exprès aux noms de classes de `Terminal.module.css`.

Ce qui ne doit **pas** être local (polices, variables, `body`) est dans `global.css`, importé une seule fois dans `main.tsx`.

### 5.2 Les variables CSS (custom properties)

```css
:root { --accent-400: #71cdf5; }
.prompt { color: var(--accent-400); }
```

Une variable CSS peut aussi être définie **depuis React**, sur un élément précis, et ses enfants en héritent :

```tsx
<a style={{ '--project-color': project.color }}>   // chaque carte a sa couleur
```

```css
.media {
  background: radial-gradient(..., color-mix(in srgb, var(--project-color) 55%, transparent), ...);
}
```

C'est le meilleur moyen de passer une valeur dynamique au CSS sans écrire tout le style en JS.

Même idée dans `Neofetch.tsx` : `style={{ background: \`var(--${token})\` }}` construit le nom de la variable, pour afficher la palette.

### 5.3 Fonctions CSS modernes utilisées

| Code                                                 | Signification                                                                                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `clamp(1.8rem, 5vw, 2.6rem)`                         | « 5 % de la largeur d'écran, mais jamais moins de 1.8rem ni plus de 2.6rem ». Taille fluide sans media query                           |
| `color-mix(in srgb, var(--bg-900) 85%, transparent)` | mélange deux couleurs, ici pour rendre une variable semi-transparente                                                                  |
| `repeat(auto-fill, minmax(min(100%, 300px), 1fr))`   | grille responsive : autant de colonnes de ≥ 300px que possible ; `min(100%, …)` évite de déborder sur les écrans plus petits que 300px |
| `aspect-ratio: 16 / 9`                               | la zone image garde toujours ce ratio                                                                                                  |
| `inset: 1.25rem`                                     | raccourci pour `top/right/bottom/left`                                                                                                 |
| `object-fit: contain`                                | l'image tient entière dans sa boîte sans être déformée                                                                                 |

**🧠 Petit quiz**

1. Pourquoi deux fichiers `.module.css` peuvent avoir une classe `.title` sans conflit ?
2. Sur un écran de 320px, que vaut `clamp(1rem, 10vw, 3rem)` ?
3. Comment chaque carte a sa propre couleur de halo sans écrire une classe CSS par projet ?

<details>
<summary>Voir les réponses</summary>

1. Vite renomme chaque classe avec un nom unique par fichier (`_title_ab12c`).
2. `10vw` = 32px = 2rem, entre 1rem et 3rem → **2rem**.
3. React met `--project-color` dans le `style` de la carte, et le CSS l'utilise avec `var(--project-color)`.

</details>

### 5.4 Mise en page : quelques détails qui comptent

- **Header collant** : `position: sticky; top: 0` + `backdrop-filter: blur(10px)` (le flou derrière la barre).
- **`scroll-margin-top: 5rem`** sur les sections : quand on scrolle vers `#projets`, le titre ne se cache pas sous le header collant.
- **`min-width: 0`** sur les éléments de grille/flex : par défaut, un élément flex ne rétrécit pas en dessous de la largeur de son contenu (ici les images). Sans ça, une grande image peut faire déborder la carte sur mobile.
- **Image en `position: absolute`** dans un parent `position: relative` + `aspect-ratio` : l'image remplit la zone sans pouvoir l'agrandir.

### 5.5 Les animations

```css
/* Neofetch : chaque ligne glisse depuis la gauche */
.row { animation: line-in 300ms ease-out both; }
@keyframes line-in {
  from { opacity: 0; transform: translateX(-6px); }   /* pas de "to" = vers l'état normal */
}
```

```tsx
style={{ animationDelay: `${i * 60}ms` }}   // décalage par ligne → effet "cascade"
```

- `both` : l'élément garde l'état `from` pendant son délai (sinon il apparaîtrait puis disparaîtrait).
- Curseur qui clignote : `animation: blink 1.1s steps(1) infinite;` avec `50% { opacity: 0 }`. `steps(1)` fait un clignotement **net** au lieu d'un fondu.
- Scanlines CRT : un `body::after` fixe, par-dessus tout, avec un `repeating-linear-gradient` de fines lignes noires. `pointer-events: none` laisse passer les clics.

### 5.6 Respecter les préférences utilisateur

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

Certaines personnes désactivent les animations dans leur système (mal des transports, épilepsie…). On respecte ce choix.

`:focus-visible` affiche le contour bleu **seulement** quand on navigue au clavier, pas au clic souris.

**🧠 Petit quiz**

1. Pourquoi les scanlines (`body::after`, par-dessus tout) n'empêchent pas de cliquer ?
2. Que change `steps(1)` dans l'animation du curseur ?
3. Pourquoi `min-width: 0` sur les `<li>` de la grille ?

<details>
<summary>Voir les réponses</summary>

1. `pointer-events: none` : les clics passent à travers.
2. Le curseur passe d'un coup de visible à invisible, au lieu de faire un fondu.
3. Un élément flex/grid ne rétrécit pas sous la taille de son contenu par défaut : sans ça, une grande image peut faire déborder la carte.

</details>

---

## 6. Accessibilité

Les petits attributs que tu as vus un peu partout :

| Code                                                                   | Pourquoi                                                                                 |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `aria-hidden="true"` sur les icônes `<i>` et la déco                   | les lecteurs d'écran ne lisent pas « icône icône icône »                                 |
| `alt=""` sur les images de projets                                     | image décorative : le nom du projet est déjà écrit juste en dessous                      |
| `aria-pressed={active}` sur les filtres                                | annonce « bouton, enfoncé » ; sert aussi de sélecteur CSS : `.chip[aria-pressed='true']` |
| `aria-live="polite"` sur « Mail copié ! »                              | le lecteur d'écran annonce le changement de texte                                        |
| `<label htmlFor="terminal-input">`                                     | relie le prompt à l'input (cliquer dessus focus l'input)                                 |
| `rel="noopener noreferrer"` + `target="_blank"`                        | sécurité : la page ouverte ne peut pas contrôler ton onglet                              |
| `<button type="button">`                                               | sans `type`, un bouton dans un `<form>` l'envoie                                         |
| balises `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<dl>` | la structure de la page est compréhensible pour les lecteurs d'écran et pour Google      |

**🧠 Petit quiz**

1. Pourquoi les images de projets ont `alt=""` et pas `alt={project.name}` ?
2. Pourquoi `type="button"` sur les filtres ?

<details>
<summary>Voir les réponses</summary>

1. Le nom est écrit juste en dessous : un lecteur d'écran le lirait deux fois. L'image est décorative.
2. Par défaut, un `<button>` est de type `submit` : placé dans un `<form>`, il l'enverrait. Ici les filtres ne sont pas dans un formulaire, mais c'est une bonne habitude qui évite le bug le jour où ils le seront.

</details>

---

## 7. Exercices

Dans l'ordre, du plus simple au plus dur. Chacun touche une notion de ce fichier.

1. **Ajoute une commande `date`** qui affiche la date du jour. *(table de dispatch, 4.1)*
2. **Ajoute un dossier `cd discord`** qui ouvre ton Discord. *(`directories`, `links`)*
3. **Ajoute une techno `rust`** et mets-la sur un projet. Vérifie que le filtre apparaît tout seul. *(`satisfies` / `keyof typeof`, 1.6)*
4. **Fais une commande `theme`** qui affiche la liste des variables `--accent-*` avec leur couleur. Indice : un nouveau `Tone` ou un nouveau champ dans `OutputLine`. *(unions, 1.2 ; CSS modules dynamiques, 5.1)*
5. **Complète la Tab pour les arguments** : `cd pro` + Tab → `cd projets`. Indice : regarde comment `commandNames` est exporté et fais pareil pour les dossiers. *(4.4)*
6. **Ajoute une commande `contact`** qui scrolle vers la section contact **et** copie le mail. Il faudra ajouter une action `copyEmail` à `CommandActions`. Observe que TS t'oblige à l'implémenter dans `Terminal`. *(injection de dépendances, 4.2)*
7. **Mémorise le filtre de projets dans l'URL** (`?stack=python`) pour pouvoir partager un lien filtré. *(useEffect, état dérivé)*
8. **Écris un vrai test** pour `runCommand` avec [Vitest](https://vitest.dev) (`npm i -D vitest`), en injectant de fausses actions. *(fonctions pures, 4.3)*

Si tu bloques, demande-moi de t'**expliquer** l'erreur ou de te donner un indice, plutôt que la solution 😉
