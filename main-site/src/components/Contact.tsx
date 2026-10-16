import { useState } from 'react';
import { links, profile } from '../data/profile';
import { SectionTitle } from './SectionTitle';
import styles from './Contact.module.css';

const socials = [
  { label: 'GitHub', href: links.github, icon: 'fa-brands fa-github' },
  { label: 'YouTube', href: links.youtube, icon: 'fa-brands fa-youtube' },
  { label: 'Discord', href: links.discord, icon: 'fa-brands fa-discord' },
  { label: 'LinkTree', href: links.linktree, icon: 'fa-solid fa-link' },
];

export function Contact() {
  const [copied, setCopied] = useState(false);

  async function copyMail() {
    await navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section id="contact" className={styles.section}>
      <SectionTitle path="contact" />
      <div className={styles.links}>
        <button type="button" className={`${styles.link} ${styles.primary}`} onClick={copyMail}>
          <i className={copied ? 'fa-solid fa-check' : 'fa-solid fa-envelope'} aria-hidden="true" />
          <span aria-live="polite">{copied ? 'Mail copié !' : 'Copier mail'}</span>
        </button>
        {socials.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
            <i className={s.icon} aria-hidden="true" /> {s.label}
          </a>
        ))}
      </div>
    </section>
  );
}
