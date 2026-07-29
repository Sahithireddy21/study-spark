import { BookOpenCheck, Brain, ClipboardList, Save, Trash2 } from 'lucide-react';
import { FlashcardsView } from './FlashcardsView';
import { QuizView } from './QuizView';
import { ChecklistView } from './ChecklistView';

export function StudyWorkspace({ studySet, activeTab, setActiveTab, cardIndex, setCardIndex, flipped, setFlipped, answers, setAnswers, score, wrongQuestions, resetQuiz, checked, setChecked, onSave, onClear }) {
  return (
    <section className="workspace-card">
      <header className="study-header">
        <div>
          <p className="eyebrow">{studySet.difficulty}</p>
          <h2>{studySet.title}</h2>
          <p>{studySet.summary}</p>
        </div>
        <div className="header-actions">
          <button className="ghost icon-text" onClick={onSave}><Save size={17} /> Save</button>
          <button className="ghost icon-text" onClick={onClear}><Trash2 size={17} /> Clear</button>
        </div>
      </header>

      <nav className="tabs" aria-label="Study modes">
        <button className={activeTab === 'cards' ? 'active' : ''} onClick={() => setActiveTab('cards')}><BookOpenCheck size={16} /> Flashcards</button>
        <button className={activeTab === 'quiz' ? 'active' : ''} onClick={() => setActiveTab('quiz')}><Brain size={16} /> Quiz</button>
        <button className={activeTab === 'plan' ? 'active' : ''} onClick={() => setActiveTab('plan')}><ClipboardList size={16} /> Drill Plan</button>
      </nav>

      <div className={`tab-panel ${activeTab}`}>
        {activeTab === 'cards' && (
          <FlashcardsView
            cards={studySet.cards}
            cardIndex={cardIndex}
            setCardIndex={setCardIndex}
            flipped={flipped}
            setFlipped={setFlipped}
          />
        )}
        {activeTab === 'quiz' && (
          <QuizView
            questions={studySet.quiz}
            answers={answers}
            setAnswers={setAnswers}
            score={score}
            wrongQuestions={wrongQuestions}
            resetQuiz={resetQuiz}
          />
        )}
        {activeTab === 'plan' && (
          <ChecklistView tasks={studySet.checklist} checked={checked} setChecked={setChecked} />
        )}
      </div>
    </section>
  );
}
