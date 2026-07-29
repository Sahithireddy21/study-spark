import { ChevronLeft, ChevronRight } from 'lucide-react';

export function FlashcardsView({ cards, cardIndex, setCardIndex, flipped, setFlipped }) {
  const card = cards[cardIndex];

  function move(direction) {
    setCardIndex((index) => (index + direction + cards.length) % cards.length);
    setFlipped(false);
  }

  return (
    <div className="cards-mode">
      <button className="icon-button" onClick={() => move(-1)} aria-label="Previous card"><ChevronLeft /></button>
      <div className={`flashcard-shell ${flipped ? 'flipped' : ''}`}>
        <button className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((value) => !value)}>
          <div className="flashcard-glow" />
          <span>{cardIndex + 1} / {cards.length}</span>
          <h3>{flipped ? card.answer : card.term}</h3>
          <p>{flipped ? 'Tap to return to the term.' : card.hint}</p>
        </button>
      </div>
      <button className="icon-button" onClick={() => move(1)} aria-label="Next card"><ChevronRight /></button>
    </div>
  );
}
