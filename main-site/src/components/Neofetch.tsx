import meImg from '../../../assets/me.png';
import { neofetchInfo, profile } from '../data/profile';
import styles from './Neofetch.module.css';

const title = `${profile.user}@${profile.handle}`;
const swatches = [
  'bg-950', 'bg-800', 'bg-600', 'bg-400', 'accent-700', 'accent-500', 'accent-300', 'text-100',
  'bg-900', 'bg-700', 'bg-500', 'accent-800', 'accent-600', 'accent-400', 'accent-200', 'text-300',
];

export function Neofetch() {
  return (
    <div className={styles.neofetch}>
      <img src={meImg} alt="Avatar d'Axel" className={styles.avatar} />
      <div className={styles.info}>
        <p className={styles.title}>
          <span className={styles.accent}>{profile.user}</span>@<span className={styles.accent}>{profile.handle}</span>
        </p>
        <p className={styles.separator} aria-hidden="true">{'-'.repeat(title.length)}</p>
        <dl className={styles.list}>
          {neofetchInfo.map(([label, value], i) => (
            <div key={label} className={styles.row} style={{ animationDelay: `${i * 60}ms` }}>
              <dt>{label}:</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.colors} aria-hidden="true">
          {swatches.map((token) => (
            <span key={token} style={{ background: `var(--${token})` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
