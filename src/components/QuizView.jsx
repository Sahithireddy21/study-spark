import { RotateCcw } from 'lucide-react';

export function QuizView({ questions, answers, setAnswers, score, wrongQuestions, resetQuiz }) {
  return (
    <div className="quiz-mode">
      <div className="score-strip">
        <strong>{score}/{questions.length}</strong>
        <span>{wrongQuestions.length} to retest</span>
        <button className="ghost icon-text" onClick={() => resetQuiz(false)}><RotateCcw size={16} /> Reset</button>
        <button className="ghost" disabled={!wrongQuestions.length} onClick={() => resetQuiz(true)}>Retest wrong</button>
      </div>
      <div className="question-list">
        {questions.map((q, qIndex) => {
          const selected = answers[q.id];
          return (
            <article className="question-card" key={q.id}>
              <h3>{qIndex + 1}. {q.question}</h3>
              <div className="options">
                {q.options.map((option, optionIndex) => {
                  const isSelected = selected === optionIndex;
                  const isCorrect = selected !== undefined && q.answerIndex === optionIndex;
                  const isWrong = isSelected && selected !== q.answerIndex;
                  return (
                    <button
                      key={option}
                      className={`${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                      onClick={() => setAnswers((current) => ({ ...current, [q.id]: optionIndex }))}
                    >
                      <span className="option-mark">{String.fromCharCode(65 + optionIndex)}</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
              {selected !== undefined && <p className="explanation">{q.explanation}</p>}
            </article>
          );
        })}
      </div>
    </div>
  );
}
