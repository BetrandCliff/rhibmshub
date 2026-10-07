'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LostFoundForm() {
  const [type, setType] = useState<'MISSING' | 'FOUND'>('MISSING');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/lost-found', {
        method: 'POST',
        body: new FormData(form),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || 'The item could not be posted.');
        setBusy(false);
        return;
      }
      form.reset();
      setType('MISSING');
      setBusy(false);
      router.refresh();
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
      setBusy(false);
    }
  }

  return (
    <form className="lost-found-form" onSubmit={submit}>
      <div className="form-pair">
        <div className="field">
          <label htmlFor="item-type">Report type</label>
          <select id="item-type" name="type" value={type} onChange={(event) => setType(event.target.value as 'MISSING' | 'FOUND')}>
            <option value="MISSING">I lost an item</option>
            <option value="FOUND">I found an item</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="item-name">Item name</label>
          <input className="input" id="item-name" name="itemName" maxLength={120} required placeholder="e.g. Blue backpack" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="item-description">Description</label>
        <textarea className="input" id="item-description" name="description" minLength={5} maxLength={3000} rows={4} required placeholder="Describe the item, including identifying details." />
      </div>
      <div className="form-pair">
        <div className="field">
          <label htmlFor="item-location">Last seen / found at</label>
          <input className="input" id="item-location" name="location" maxLength={200} required placeholder="Building, room, or campus area" />
        </div>
        <div className="field">
          <label htmlFor="contact-name">{type === 'FOUND' ? 'Found by' : 'Contact person'}</label>
          <input className="input" id="contact-name" name="contactName" maxLength={120} required placeholder={type === 'FOUND' ? 'Name of the person who found it' : 'Name of the person to contact'} />
        </div>
      </div>
      <div className="form-pair">
        <div className="field">
          <label htmlFor="contact-details">Contact details</label>
          <input className="input" id="contact-details" name="contactDetails" maxLength={200} required placeholder="Email, phone, or where to collect it" />
        </div>
        <div className="field">
          <label htmlFor="item-image">Item image</label>
          <input className="input" id="item-image" name="image" type="file" accept="image/jpeg,image/png,image/webp" required />
          <small className="muted">JPG, PNG, or WebP; maximum 8 MB.</small>
        </div>
      </div>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>{busy ? 'Posting…' : 'Post item'}</button>
    </form>
  );
}
