export const sampleSet = {
  title: 'Photosynthesis Sprint',
  summary: 'Plants convert light energy into chemical energy using chlorophyll. The process produces glucose and oxygen while cycling carbon dioxide and water through light-dependent and Calvin cycle reactions.',
  difficulty: 'Intermediate',
  cards: [
    { id: 'c1', term: 'Chlorophyll', answer: 'A green pigment that absorbs light energy for photosynthesis.', hint: 'Found in chloroplasts.' },
    { id: 'c2', term: 'Stomata', answer: 'Tiny leaf openings that regulate gas exchange.', hint: 'They open and close.' },
    { id: 'c3', term: 'Calvin cycle', answer: 'Light-independent reactions that build sugars from carbon dioxide.', hint: 'Uses ATP and NADPH.' }
  ],
  quiz: [
    { id: 'q1', question: 'What gas is released during photosynthesis?', options: ['Nitrogen', 'Oxygen', 'Methane', 'Hydrogen'], answerIndex: 1, explanation: 'Water is split in light reactions, releasing oxygen.' },
    { id: 'q2', question: 'Where does photosynthesis happen?', options: ['Ribosome', 'Nucleus', 'Chloroplast', 'Mitochondrion'], answerIndex: 2, explanation: 'Chloroplasts contain chlorophyll and the reaction machinery.' }
  ],
  checklist: [
    { id: 't1', text: 'Explain the light reactions.' },
    { id: 't2', text: 'Review the Calvin cycle inputs and outputs.' }
  ]
};

export function validateStudySet(data) {
  if (!data || typeof data !== 'object') throw new Error('The AI response was empty.');
  const requiredText = ['title', 'summary', 'difficulty'];
  requiredText.forEach((key) => {
    if (typeof data[key] !== 'string' || data[key].trim().length === 0) {
      throw new Error(`The AI response is missing ${key}.`);
    }
  });
  if (!Array.isArray(data.cards) || data.cards.length === 0) throw new Error('No flashcards were returned.');
  if (!Array.isArray(data.quiz) || data.quiz.length === 0) throw new Error('No quiz questions were returned.');
  if (!Array.isArray(data.checklist)) throw new Error('The practice checklist is missing.');

  const cards = data.cards.slice(0, 12).map((card, index) => ({
    id: String(card.id || `card-${index}`),
    term: String(card.term || '').trim(),
    answer: String(card.answer || '').trim(),
    hint: String(card.hint || 'Think about the core idea.').trim()
  })).filter((card) => card.term && card.answer);

  const quiz = data.quiz.slice(0, 10).map((item, index) => {
    const options = Array.isArray(item.options) ? item.options.map(String).slice(0, 4) : [];
    return {
      id: String(item.id || `quiz-${index}`),
      question: String(item.question || '').trim(),
      options,
      answerIndex: Number(item.answerIndex),
      explanation: String(item.explanation || 'Review the related flashcard.').trim()
    };
  }).filter((item) => item.question && item.options.length === 4 && item.answerIndex >= 0 && item.answerIndex < 4);

  const checklist = data.checklist.slice(0, 8).map((item, index) => ({
    id: String(item.id || `task-${index}`),
    text: String(item.text || '').trim()
  })).filter((item) => item.text);

  if (!cards.length || !quiz.length) throw new Error('The AI returned the wrong shape. Please retry.');
  return {
    title: data.title.trim(),
    summary: data.summary.trim(),
    difficulty: data.difficulty.trim(),
    cards,
    quiz,
    checklist
  };
}
