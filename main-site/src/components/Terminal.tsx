import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { commandNames, runCommand, type CommandActions, type OutputLine } from '../lib/commands';
import { Neofetch } from './Neofetch';
import styles from './Terminal.module.css';

type Entry = { id: number; input: string; output: OutputLine[] };

const PROMPT = '~/portfolio$';

export function Terminal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState('');
  const [neofetchKey, setNeofetchKey] = useState(0);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(0);
  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pas d'autofocus sur mobile : ça ouvrirait le clavier dès l'arrivée.
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    inputRef.current?.scrollIntoView({ block: 'nearest' });
  }, [entries]);

  const actions: CommandActions = {
    showNeofetch: () => setNeofetchKey((k) => k + 1),
    scrollTo: (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
    openUrl: (url, sameTab) => (sameTab ? window.location.assign(url) : window.open(url, '_blank', 'noopener')),
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    const input = value.trim();
    setValue('');
    if (input) history.current.push(input);
    historyIndex.current = history.current.length;

    const result = runCommand(input, actions);
    if (result === 'clear') {
      setEntries([]);
      return;
    }
    setEntries((prev) => [...prev, { id: nextId.current++, input, output: result ?? [] }]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const h = history.current;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const delta = e.key === 'ArrowUp' ? -1 : 1;
      historyIndex.current = Math.min(Math.max(historyIndex.current + delta, 0), h.length);
      setValue(h[historyIndex.current] ?? '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = commandNames.filter((name) => name.startsWith(value));
      if (value && match.length === 1) setValue(`${match[0]} `);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  }

  return (
    <section className={styles.window} aria-label="Terminal" onClick={() => inputRef.current?.focus()}>
      <header className={styles.titlebar}>
        <span className={styles.dots} aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className={styles.titleText}>axel@OrAxelerator: ~/portfolio</span>
      </header>

      <div className={styles.body}>
        <p className={styles.line}>
          <span className={styles.prompt}>❯</span> neofetch
        </p>
        <Neofetch key={neofetchKey} />
        <p className={`${styles.line} ${styles.hint}`}>Tape 'help' pour voir les commandes.</p>

        {entries.map((entry) => (
          <div key={entry.id}>
            <p className={styles.line}>
              <span className={styles.prompt}>{PROMPT}</span> {entry.input}
            </p>
            {entry.output.map((out, i) => (
              <p key={i} className={`${styles.line} ${styles[out.tone ?? 'default']}`}>
                {out.text}
              </p>
            ))}
          </div>
        ))}

        <form onSubmit={submit} className={styles.inputRow}>
          <label htmlFor="terminal-input" className={styles.prompt}>{PROMPT}</label>
          <input
            id="terminal-input"
            ref={inputRef}
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
          />
        </form>
      </div>
    </section>
  );
}
