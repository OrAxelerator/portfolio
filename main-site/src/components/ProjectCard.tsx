import type { CSSProperties } from 'react';
import type { Project } from '../data/projects';
import { stackMeta } from '../data/stack';
import styles from './ProjectCard.module.css';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      style={{ '--project-color': project.color } as CSSProperties}
    >
      <div className={styles.media}>
        <img src={project.img} alt="" loading="lazy" className={styles.img} />
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{project.name}</h3>
        {project.description && <p className={styles.description}>{project.description}</p>}

        {project.stack.length > 0 && (
          <ul className={styles.stack} aria-label="Stack">
            {project.stack.map((s) => (
              <li key={s} title={stackMeta[s].label}>
                <i className={stackMeta[s].icon} aria-hidden="true" />
                <span>{stackMeta[s].label}</span>
              </li>
            ))}
          </ul>
        )}

        <span className={styles.more}>
          Voir plus →
          {/* <span aria-hidden="true"></span> */}
        </span>
      </div>
    </a>
  );
}
