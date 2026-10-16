import { Contact } from './components/Contact';
import { Header } from './components/Header';
import { Projects } from './components/Projects';
import { Terminal } from './components/Terminal';
import { profile } from './data/profile';

export function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Terminal />
        <Projects />
        <Contact />
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} {profile.handle} -
      </footer>
    </>
  );
}
