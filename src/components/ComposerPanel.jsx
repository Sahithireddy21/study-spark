import { Layers3, Loader2, ShieldCheck, Sparkles, Wand2, Zap } from 'lucide-react';

export function ComposerPanel({ notes, setNotes, status, onGenerate, onLoadDemo }) {
  const wordCount = notes.trim().split(/\s+/).filter(Boolean).length;

  return (
    <section className="composer-card">
      <div className="hero-kicker">
        <span><Sparkles size={14} /> Structured AI workspace</span>
        <span><Zap size={14} /> Interactive output</span>
      </div>
      <div className="section-title">
        <span className="title-icon"><Wand2 size={20} /></span>
        <h1>Turn messy notes into a vibrant study cockpit.</h1>
      </div>
      <p className="hero-copy">
        Paste any topic, and Study Spark will transform it into engaging cards, a scored quiz, and a focused drill plan.
      </p>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Paste lecture notes, a topic, or a rough paragraph..."
      />
      <div className="composer-actions">
        <button className="primary" onClick={onGenerate} disabled={status === 'loading'}>
          {status === 'loading' ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
          Generate set
        </button>
        <button className="ghost" onClick={onLoadDemo}>Try demo</button>
      </div>
      <div className="micro-dashboard" aria-label="Generation safeguards">
        <span><Layers3 size={15} /> {wordCount} words</span>
        <span><ShieldCheck size={15} /> Validates JSON</span>
        <span><Zap size={15} /> Blocks stale replies</span>
      </div>
    </section>
  );
}
