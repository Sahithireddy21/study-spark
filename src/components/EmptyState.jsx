import { Loader2, Sparkles } from 'lucide-react';

export function EmptyState({ loading }) {
  return (
    <section className="empty-card">
      {loading ? <Loader2 className="spin" size={28} /> : <Sparkles size={28} />}
      <h2>{loading ? 'Building your study set...' : 'No generated set yet'}</h2>
      <p>{loading ? 'The app is validating the structured output before anything renders.' : 'Create a fresh set from your notes or explore the demo to see the experience.'}</p>
    </section>
  );
}
