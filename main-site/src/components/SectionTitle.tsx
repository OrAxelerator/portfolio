import styles from './SectionTitle.module.css';

export function SectionTitle({ path }: { path: string }) {
  return (
    <h2 className={styles.title}>
      <span className={styles.prompt}>❯ cd ~/</span>
      {path}
      <span className={styles.cursor} aria-hidden="true" />
    </h2>
  );
}
