import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle } from 'lucide-react';
import './styles.css';
import { ComposerPanel } from './components/ComposerPanel';
import { EmptyState } from './components/EmptyState';
import { StudyWorkspace } from './components/StudyWorkspace';
import { sampleSet, validateStudySet } from './lib/studyData';
import { TopBar } from './components/TopBar';

const STORAGE_KEY = 'study-spark-session';

function App() {
  const [notes, setNotes] = useState('Explain React hooks, especially useState, useEffect, dependency arrays, and common mistakes.');
  const [studySet, setStudySet] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('cards');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [dark, setDark] = useState(true);
  const latestRequest = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudySet(validateStudySet(parsed.studySet));
        setAnswers(parsed.answers || {});
        setChecked(parsed.checked || {});
        setNotes(parsed.notes || '');
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  const quizPool = useMemo(() => studySet?.quiz || [], [studySet]);
  const wrongQuestions = quizPool.filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.answerIndex);
  const score = quizPool.length
    ? quizPool.filter((q) => answers[q.id] === q.answerIndex).length
    : 0;

  async function generate() {
    const requestId = Date.now();
    latestRequest.current = requestId;
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/generate-study-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      const data = await response.json();
      if (latestRequest.current !== requestId) return;
      if (!response.ok) throw new Error(data.error || 'The AI request failed.');
      const clean = validateStudySet(data);
      setStudySet(clean);
      setAnswers({});
      setChecked({});
      setCardIndex(0);
      setFlipped(false);
      setActiveTab('cards');
      setStatus('success');
    } catch (err) {
      if (latestRequest.current === requestId) {
        setError(err.message || 'Something went wrong.');
        setStatus('error');
      }
    }
  }

  function loadDemo() {
    setStudySet(validateStudySet(sampleSet));
    setAnswers({});
    setChecked({});
    setCardIndex(0);
    setFlipped(false);
    setError('');
    setStatus('success');
  }

  function saveSession() {
    if (!studySet) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ studySet, notes, answers, checked }));
    setStatus('saved');
    window.setTimeout(() => setStatus('success'), 1200);
  }

  function resetQuiz(onlyWrong = false) {
    if (!onlyWrong) {
      setAnswers({});
      return;
    }
    const next = { ...answers };
    wrongQuestions.forEach((q) => delete next[q.id]);
    setAnswers(next);
  }

  return (
    <main className="shell">
      <section className="studio">
        <TopBar dark={dark} onToggleTheme={() => setDark((value) => !value)} />

        <section className="hero-stage">
          <div className="motion-field" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <ComposerPanel
            notes={notes}
            setNotes={setNotes}
            status={status}
            onGenerate={generate}
            onLoadDemo={loadDemo}
          />
        </section>

        {error && (
          <div className="alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={generate}>Retry</button>
          </div>
        )}

        {!studySet ? (
          <EmptyState loading={status === 'loading'} />
        ) : (
          <StudyWorkspace
            studySet={studySet}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            cardIndex={cardIndex}
            setCardIndex={setCardIndex}
            flipped={flipped}
            setFlipped={setFlipped}
            answers={answers}
            setAnswers={setAnswers}
            score={score}
            wrongQuestions={wrongQuestions}
            resetQuiz={resetQuiz}
            checked={checked}
            setChecked={setChecked}
            onSave={saveSession}
            onClear={() => setStudySet(null)}
          />
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
