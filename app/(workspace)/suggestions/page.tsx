import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { canAccessSuggestions } from '@/lib/roles';
import SuggestionForm from './suggestion-form';

export default async function SuggestionsPage() {
  const user = await requireUser();
  const canReview = canAccessSuggestions(user.role);
  const suggestions = canReview ? await db.suggestion.findMany({ include: { sender: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } }) : [];
  return <>
    <div className="top"><div><div className="eyebrow">CAMPUS FEEDBACK</div><h1>Suggestions</h1><p>Share an idea to help improve your academic workspace.</p></div></div>
    <section className="card suggestion-submit"><h2>Send a suggestion</h2><p className="muted">Everyone in the workspace can submit feedback. Academic administrators can review submissions.</p><SuggestionForm /></section>
    {canReview && <section className="card suggestion-inbox"><div className="dashboard-section-head"><div><h2>Suggestion inbox</h2><p>Visible to academic administrators only.</p></div><span className="private-chip">PRIVATE · {suggestions.length}</span></div>{suggestions.length ? <div className="suggestion-list">{suggestions.map((item) => <article key={item.id}><p>{item.message}</p><small>{item.sender?.name ?? 'Former user'}{item.sender ? ` · ${item.sender.email}` : ''} · {item.createdAt.toLocaleString()}</small></article>)}</div> : <div className="empty-state"><b>No suggestions yet</b><p>New submissions will appear here.</p></div>}</section>}
  </>;
}
