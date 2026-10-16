# Comment marche le portfolio

Ce fichier explique **la vue d'ensemble** : quels outils sont utilisés, comment les fichiers s'organisent, et comment les données circulent de l'un à l'autre.
Pour le détail des notions (types TS, hooks, patterns…), voir [`NOTIONS.md`](./NOTIONS.md).

---

## 1. Les outils (les « dépendances »)

Tout est déclaré dans `package.json`.

| Outil | Rôle | Où ça intervient |
|---|---|---|
| **React** (`react`) | La bibliothèque qui transforme des composants (fonctions qui renvoient du JSX) en interface | tous les `.tsx` |
| **ReactDOM** (`react-dom`) | Le pont entre React et le vrai DOM du navigateur | `src/main.tsx` (`createRoot`) |
| **TypeScript** (`typescript`) | Ajoute des types à JS et **vérifie** le code avant qu'il tourne. Il ne produit pas le JS final (c'est Vite qui s'en charge) | `tsconfig.json`, commande `tsc --noEmit` |
| **Vite** (`vite`) | Serveur de dev ultra rapide + « bundler » qui fabrique la version finale dans `dist/` | `vite.config.ts` |
| **@vitejs/plugin-react** | Apprend à Vite à comprendre le JSX et active le rechargement à chaud (la page se met à jour sans perdre son état quand tu sauvegardes) | `vite.config.ts` |
| **@types/react**, **@types/react-dom** | Les définitions de types de React pour TypeScript (React lui-même est écrit en JS) | utilisé automatiquement |
| **Font Awesome 6.5** | Les icônes (`<i className="fa-brands fa-github" />`). Chargé par un `<link>` vers un CDN, pas via npm | `index.html` |
| **Polices** VCR OSD Mono et 0xProto | Chargées avec `@font-face` depuis `../assets/fonts` | `src/styles/global.css` |

`dependencies` = ce qui part dans le site final (React).
`devDependencies` = ce qui sert seulement à développer/compiler (Vite, TypeScript, les types).

### Les commandes

```sh
npm install        # installe tout ce qui est listé dans package.json → node_modules/
npm run dev        # lance Vite en mode dev (http://localhost:5173)
npm run build      # 1) tsc --noEmit : vérifie les types  2) vite build : produit dist/
npm run preview    # sert dist/ pour vérifier la version finale
npm run typecheck  # juste la vérification des types
```

Si `tsc` trouve une erreur de type, `build` s'arrête **avant** de produire le site. C'est voulu : on ne déploie pas du code faux.

---

## 2. L'organisation des fichiers

```
main-site/
├── index.html              ← la seule page HTML. Contient <div id="root"> et charge src/main.tsx
├── vite.config.ts          ← config de Vite
├── tsconfig.json           ← config de TypeScript
├── package.json            ← dépendances + scripts npm
└── src/
    ├── main.tsx            ← point d'entrée : monte <App /> dans #root
    ├── App.tsx             ← la page : Header + Terminal + Projects + Contact + footer
    ├── data/               ← LES DONNÉES (aucun affichage ici)
    │   ├── profile.ts      ←   pseudo, mail, liens, lignes du neofetch
    │   ├── projects.ts     ←   la liste des projets + le type Project
    │   └── stack.ts        ←   les technos possibles (label + icône) + le type Stack
    ├── lib/
    │   └── commands.ts     ← LA LOGIQUE du terminal (aucun affichage ici non plus)
    ├── components/         ← L'AFFICHAGE : un composant = un .tsx + son .module.css
    │   ├── Header.tsx
    │   ├── Terminal.tsx    ←   fenêtre de terminal, gère la saisie et l'historique
    │   ├── Neofetch.tsx    ←   avatar + infos + palette
    │   ├── Projects.tsx    ←   filtres + grille
    │   ├── ProjectCard.tsx ←   une carte projet
    │   ├── SectionTitle.tsx←   le titre "❯ cd ~/xxx" avec curseur qui clignote
    │   └── Contact.tsx
    └── styles/
        └── global.css      ← polices, variables de couleurs, styles de base
```

### L'idée clé : séparer en 3 couches

```
  data/  ──────►  lib/  ──────►  components/
 (QUOI)         (COMMENT)        (À QUOI ÇA RESSEMBLE)
```

- **data/** ne sait pas qu'il existe un écran. C'est juste des objets.
- **lib/commands.ts** ne sait pas qu'il existe React. Il reçoit un texte, il renvoie un résultat.
- **components/** prennent les données/résultats et les affichent.

Pourquoi c'est bien : pour ajouter un projet, tu touches **un seul fichier** (`projects.ts`) et tout le reste suit (la grille, les filtres, la commande `projets`, la commande `open`). Dans l'ancienne version, les données, la logique et le DOM étaient mélangés dans `script.js`, donc chaque changement demandait de comprendre tout le fichier.

---

## 3. Du chargement de la page à l'affichage

```
navigateur ouvre index.html
  └─ <script type="module" src="/src/main.tsx">
       └─ main.tsx : createRoot(#root).render(<App />)
            └─ App.tsx renvoie :
                 <Header />
                 <main>
                   <Terminal />   → affiche <Neofetch /> + l'historique + l'input
                   <Projects />   → affiche les filtres + plusieurs <ProjectCard />
                   <Contact />
                 </main>
                 <footer>
```

React appelle chaque fonction-composant, récupère le JSX, et construit le DOM. Quand un **state** change (ex : on clique un filtre), React rappelle la fonction du composant concerné, compare l'ancien et le nouveau résultat, et ne modifie dans le DOM que ce qui a changé. Tu ne fais jamais de `document.createElement` toi-même (contrairement à l'ancien `createCarousel()`).

---

## 4. Le terminal, pas à pas

C'est la partie la plus « complexe ». Voici ce qui se passe quand tu tapes `open 2` puis Entrée :

```
1. Chaque touche → onChange → setValue("o"), setValue("op"), ... → l'input affiche value
2. Entrée dans un <form> → onSubmit → submit(e)
3. submit :
     - e.preventDefault()               (sinon le navigateur recharge la page)
     - input = "open 2"
     - vide l'input, ajoute "open 2" à l'historique (useRef)
     - result = runCommand("open 2", actions)      ← on passe dans lib/commands.ts
4. runCommand :
     - découpe : name = "open", args = ["2"]
     - cherche commands["open"]
     - appelle commands.open.run(["2"], actions)
5. open.run :
     - findProject("2") → projects[1] (Trophée NSI)
     - actions.openUrl(lien)             ← effet sur la page, via l'objet reçu
     - renvoie [ { text: "Ouverture de Trophée NSI…", tone: "accent" } ]
6. retour dans submit :
     - result n'est pas 'clear' → setEntries([...anciennes, nouvelle entrée])
7. React re-rend Terminal → la nouvelle entrée apparaît
8. useEffect([entries]) → scrollIntoView sur l'input pour qu'il reste visible
```

**Point important :** `commands.ts` ne touche jamais au DOM ni à React. Quand une commande doit agir sur la page (scroller, ouvrir un lien, relancer neofetch), elle appelle une fonction de l'objet `actions` que **Terminal lui a donné**. C'est Terminal qui décide ce que ces actions font vraiment. (Explication détaillée dans NOTIONS.md, section « Injection de dépendances ».)

### Comment `neofetch` « se relance »

`Terminal` a un state `neofetchKey` (un nombre). Il rend `<Neofetch key={neofetchKey} />`.
La commande `neofetch` appelle `actions.showNeofetch()` → `setNeofetchKey(k => k + 1)`.
Quand la `key` d'un composant change, React le **détruit et le recrée** : les animations CSS d'apparition se rejouent. C'est l'équivalent propre de l'ancien `hideNeofetch` + `setTimeout`.

---

## 5. La section projets

```
projects (data)
   │
   ├─► usedStacks = toutes les technos utilisées, sans doublon   (calculé 1 fois)
   │      └─► un bouton FilterChip par techno
   │
   └─► filter (state, null = "tout")
          └─► visible = projects filtrés              (recalculé à chaque rendu)
                 └─► un <ProjectCard project={...} /> par projet visible
```

- `filter` est le **seul** state. `visible` n'est **pas** un state : on le recalcule à partir de `filter` à chaque rendu (voir NOTIONS.md, « état dérivé »).
- `ProjectCard` reçoit un projet en **prop** et ne fait qu'afficher. Il passe la couleur du projet au CSS via une variable CSS `--project-color`, utilisée pour le halo derrière l'image.

---

## 6. Le style

- `global.css` définit les **variables CSS** (`--bg-900`, `--accent-400`, `--text-100`, `--font-display`…). Tout le reste les utilise. Pour changer une couleur partout, on change une ligne.
  - `--bg-*` : nuances de `#0C0F0A` (950 = le plus sombre → 400 = le plus clair)
  - `--accent-*` : nuances de `#71CDF5` (200 = très clair → 950 = presque noir bleuté)
  - `--text-*` : nuances de `#EFF3F4` (100 = blanc → 500 = gris foncé)
- Chaque composant a un **CSS Module** (`Truc.module.css`). Les noms de classes y sont automatiquement rendus uniques (`.card` devient par exemple `_card_x7f2a`), donc deux composants peuvent avoir une classe `.title` sans conflit.
- `VCR OSD Mono` (`--font-display`) pour les titres, `0xProto` (`--font-mono`) pour tout le texte.

---

## 7. Build et déploiement

### Ce que fait `vite.config.ts`

```ts
base: './'                       // les liens dans dist/index.html sont relatifs (./assets/...)
server: { fs: { allow: ['..'] } } // autorise le serveur de dev à lire ../assets (en dehors de main-site/)
```

- `base: './'` : le site n'est pas à la racine d'un domaine mais à `oraxelerator.github.io/portfolio/main-site/`. Avec des chemins relatifs, ça marche peu importe le dossier.
- Les images et polices importées sont copiées dans `dist/assets/` avec un **hash** dans le nom (`me-DWcaO85H.png`). Si l'image change, le nom change, donc le navigateur ne garde jamais une vieille version en cache.

### GitHub Pages (`.github/workflows/deploy.yml` à la racine du repo)

À chaque `git push` sur `main`, GitHub Actions :
1. installe Node et les dépendances (`npm ci` : installation exacte selon `package-lock.json`)
2. lance `npm run build`
3. assemble un dossier `_site/` = `assets/` + `link-tree/` + `main-site/dist` (renommé en `main-site/`)
4. publie `_site/` sur GitHub Pages

⚠️ Il faut que *Settings → Pages → Source* soit réglé sur **GitHub Actions**.

`dist/` et `node_modules/` sont dans `.gitignore` : on ne commite jamais le résultat du build ni les dépendances, seulement le code source + `package-lock.json`.

---

## 8. Recettes : « je veux ajouter… »

| Je veux… | Je modifie… |
|---|---|
| un projet | `src/data/projects.ts` (ajouter un objet dans le tableau) |
| une techno (ex : Rust) | `src/data/stack.ts` (ajouter `rust: { label: 'Rust', icon: 'fa-brands fa-rust' }`), puis l'utiliser dans un projet |
| une ligne au neofetch | `neofetchInfo` dans `src/data/profile.ts` |
| une commande au terminal | l'objet `commands` dans `src/lib/commands.ts` |
| un dossier pour `cd` | l'objet `directories` dans `src/lib/commands.ts` |
| une couleur | les variables dans `src/styles/global.css` |
| une nouvelle section | créer `components/MaSection.tsx` + `MaSection.module.css`, l'ajouter dans `App.tsx` (et dans `Header.tsx` pour le lien) |
