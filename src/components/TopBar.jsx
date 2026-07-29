import { Brain, Moon, Sun } from 'lucide-react';

export function TopBar({ dark, onToggleTheme }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark"><Brain size={20} /></span>
        <div>
          <p>Study Spark</p>
          <span>Animated study sessions that feel alive</span>
        </div>
      </div>
      <button className="icon-button" onClick={onToggleTheme} aria-label="Toggle theme">
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
