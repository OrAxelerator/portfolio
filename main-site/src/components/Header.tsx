import { links } from '../data/profile';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Navigation principale">
        <a href="#" className={styles.logo}>
          OrA<span className={styles.logoAccent}>xelerator</span>
        </a>
        <ul className={styles.links}>
          <li><a href="#projets">projets</a></li>
          <li><a href="#contact">contact</a></li>
          <li><a href={links.linktree}>linktree</a></li>
        </ul>
      </nav>
    </header>
  );
}
