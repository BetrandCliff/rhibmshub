import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { canAccessSuggestions } from '@/lib/roles';
import SuggestionForm from './suggestion-form';
import SuggestionInboxTable from './suggestion-inbox-table';

export default async function SuggestionsPage() {
  const user = await requireUser();
  const canReview = canAccessSuggestions(user);
  const suggestions = canReview
    ? await db.suggestion.findMany({
        select: { id: true, message: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <>
      <div className="top">
        <div>
          <div className="eyebrow">CAMPUS FEEDBACK</div>
          <h1>{canReview ? 'Suggestions inbox' : 'Suggestions'}</h1>
          <p>Share an idea to help improve your academic workspace.</p>
        </div>
      </div>

      {canReview && (
        <section className="card suggestion-inbox">
          <div className="dashboard-section-head">
            <div><h2>Private suggestion inbox</h2><p>Visible to system administrators, the president, and the president’s assistant.</p></div>
            <span className="private-chip">PRIVATE · {suggestions.length}</span>
          </div>
          {suggestions.length ? (
            <SuggestionInboxTable suggestions={suggestions.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))} />
          ) : (
            <div className="empty-state"><b>No suggestions yet</b><p>New submissions will appear here.</p></div>
          )}
        </section>
      )}

      <section className="card suggestion-submit">
        <h2>Send a suggestion</h2>
        <p className="muted">Students and staff can submit anonymously. System administrators, the president, and the president’s assistant can review suggestions.</p>
        <SuggestionForm />
      </section>
    </>
  );
}
