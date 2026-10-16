import { useState, type ReactNode } from 'react';
import { projects } from '../data/projects';
import { stackMeta, type Stack } from '../data/stack';
import { ProjectCard } from './ProjectCard';
import { SectionTitle } from './SectionTitle';
import styles from './Projects.module.css';

const usedStacks = [...new Set(projects.flatMap((p) => p.stack))];

export function Projects() {
  const [filter, setFilter] = useState<Stack | null>(null);
  const visible = filter ? projects.filter((p) => p.stack.includes(filter)) : projects;

  return (
    <section id="projets" className={styles.section}>
      <SectionTitle path="projets" />

      <div className={styles.filters} role="group" aria-label="Filtrer par techno">
        <FilterChip active={filter === null} onClick={() => setFilter(null)}>
          tout
        </FilterChip>
        {usedStacks.map((stack) => (
          <FilterChip key={stack} active={filter === stack} onClick={() => setFilter(stack)}>
            <i className={stackMeta[stack].icon} aria-hidden="true" /> {stackMeta[stack].label}
          </FilterChip>
        ))}
      </div>

      <p className={styles.count}>
        total {visible.length}
      </p>

      <ul className={styles.grid}>
        {visible.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={styles.chip} aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  );
}
