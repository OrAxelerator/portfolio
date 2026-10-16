import ytChannelImg from '../../../assets/yt-channel.png';
import type { Stack } from './stack';

export type Project = {
  /** Identifiant utilisé par la commande `open`. */
  slug: string;
  name: string;
  description?: string;
  img: string;
  /** Couleur de fond derrière le visuel du projet. */
  color: string;
  link: string;
  stack: Stack[];
};

const pixelCodeImg = 'https://github.com/OrAxelerator/Pixel_Code/raw/main/docs/assets/preview.png';
const guessTheFlagImg = 'https://github.com/OrAxelerator/web/blob/main/pwa/guess_the_flag/assets/logo_gtf.png?raw=true';
const pixelInfoImg = 'https://github.com/OrAxelerator/web/raw/main/websites/pixel-info/Pixel-info_logo.png?raw=true';
const antImg = 'https://github.com/OrAxelerator/trophee_nsi_ant/raw/main/favicon.png';
const enchant = 'https://raw.githubusercontent.com/OrAxelerator/enchant/refs/heads/main/public/enchanting-table-245203281.png';
const pixelSnakeTui = 'https://raw.githubusercontent.com/OrAxelerator/pixel-snake-tui/refs/heads/main/gameplay.png';
const thumbSwap = 'https://raw.githubusercontent.com/OrAxelerator/thumbSwap/refs/heads/main/icon512.png';
const noteTube = 'https://raw.githubusercontent.com/OrAxelerator/NoteTube/refs/heads/main/icon512.png';
const tda = 'https://raw.githubusercontent.com/OrAxelerator/tda/refs/heads/main/frontend/public/cards/13_theme1.png';
// TODO: descriptions et images dédiées pour les 5 premiers projets.
export const projects: Project[] = [
  {
    slug: 'enchant',
    name: 'Enchant',
    img: enchant,
    color: 'rgb(150, 90, 230)',
    link: 'https://github.com/OrAxelerator/enchant',
    stack: ['react'],
  },
  {
    slug: 'tda',
    name: 'TDA',
    img: tda,
    color: 'rgb(49, 120, 198)',
    link: 'https://github.com/OrAxelerator/tda',
    stack: ['ts', 'react'],
  },
  {
    slug: 'pixel-snake-tui',
    name: 'Pixel_Snake_TUI',
    img: pixelSnakeTui,
    color: 'rgb(74, 180, 90)',
    link: 'https://github.com/OrAxelerator/pixel-snake-tui',
    stack: ['python', 'terminal'],
  },
  {
    slug: 'notetube',
    name: 'NoteTube',
    img: noteTube,
    color: 'rgb(200, 30, 30)',
    link: 'https://github.com/OrAxelerator/NoteTube',
    stack: ['ts', 'html5', 'css3'],
  },
  {
    slug: 'thumbswap',
    name: 'ThumbSwap',
    img: thumbSwap,
    color: 'rgb(230, 160, 40)',
    link: 'https://github.com/OrAxelerator/thumbSwap',
    stack: ['js', 'html5'],
  },
  {
    slug: 'pixel-code',
    name: 'Pixel_Code',
    description: 'TUI / gestionnaire de projet en Python',
    img: pixelCodeImg,
    color: 'rgb(109, 150, 234)',
    link: 'https://github.com/OrAxelerator/Pixel_Code',
    stack: ['python', 'terminal'],
  },
  {
    slug: 'trophee-nsi',
    name: 'Trophée NSI',
    description: 'Simulation de fourmis en Python/Flask en groupe',
    img: antImg,
    color: 'rgb(74, 149, 53)',
    link: 'https://github.com/OrAxelerator/trophee_nsi_ant',
    stack: ['python', 'flask', 'html5', 'css3', 'js'],
  },
  {
    slug: 'ora-studio',
    name: 'OrA.studio',
    description: "Ma chaîne YouTube, ça parle de code/Linux et d'autres trucs cool",
    img: ytChannelImg,
    color: 'rgb(200, 30, 30)',
    link: 'https://www.youtube.com/@OrA-creation',
    stack: [],
  },
  {
    slug: 'guess-the-flag',
    name: 'Guess the flag',
    description: 'PWA (application web) de quiz sur les drapeaux',
    img: guessTheFlagImg,
    color: 'rgb(40, 40, 40)',
    link: 'https://oraxelerator.github.io/web/pwa/guess_the_flag/',
    stack: ['js', 'html5', 'css3'],
  },
  {
    slug: 'pixel-info',
    name: 'Pixel-Info',
    description: "Autre PWA, sorte de mini-site d'actu",
    img: pixelInfoImg,
    color: 'rgb(67, 122, 247)',
    link: 'https://oraxelerator.github.io/web/websites/pixel-info/index.html',
    stack: ['js', 'html5', 'css3'],
  },
];
