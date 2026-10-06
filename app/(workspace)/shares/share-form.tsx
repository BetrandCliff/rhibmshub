
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DocumentOption = { id: string; title: string };
type Option = { id: string; name: string };
type Person = Option & { email: string };

export default function ShareFileForm({
  documents,
  offices,
  people,
}: {
  documents: DocumentOption[];
  offices: Option[];
  people: Person[];
}) {
  const [targetType, setTargetType] = useState<'USER' | 'OFFICE'>('USER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);

    const element = e.currentTarget;
    const values = new FormData(element);

    const body = {
      documentId: values.get('documentId'),
      targetType,
      ...(targetType === 'USER'
        ? { recipientUserId: values.get('recipient') }
        : { recipientOfficeId: values.get('recipient') }),
      permission: values.get('permission'),
      message: values.get('message'),
    };

    const response = await fetch('/api/shares', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || 'The document could not be shared.');
      setBusy(false);
      return;
    }

    element.reset();
    setSuccess('The document is now shared with the selected recipient.');
    setBusy(false);
    router.refresh();
  }

  return (
    <form className="share-form" onSubmit={submit}>
      {error && <div className="error">{error}</div>}

      {success && (
        <div className="share-success">
          ✓ &nbsp; {success}
        </div>
      )}

      <div className="form-pair">
        <div className="field">
          <label>Choose a document</label>

          <select
            name="documentId"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select one of your files
            </option>

            {documents.map((document) => (
              <option value={document.id} key={document.id}>
                {document.title}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Share with</label>

          <select
            value={targetType}
            onChange={(event) =>
              setTargetType(event.target.value as 'USER' | 'OFFICE')
            }
          >
            <option value="USER">A person</option>
            <option value="OFFICE">An office</option>
          </select>
        </div>
      </div>

      <div className="form-pair">
        <div className="field">
          <label>
            {targetType === 'USER' ? 'Person' : 'Office'}
          </label>

          <select
            name="recipient"
            required
            defaultValue=""
          >
            <option value="" disabled>
              {targetType === 'USER'
                ? 'Select a person'
                : 'Select an office'}
            </option>

            {targetType === 'USER'
              ? people.map((person) => (
                  <option value={person.id} key={person.id}>
                    {person.name} · {person.email}
                  </option>
                ))
              : offices.map((office) => (
                  <option value={office.id} key={office.id}>
                    {office.name}
                  </option>
                ))}
          </select>
        </div>

        <div className="field">
          <label>Permission</label>

          <select
            name="permission"
            defaultValue="DOWNLOAD"
          >
            <option value="DOWNLOAD">
              View and download
            </option>

            <option value="VIEW">
              View only
            </option>
          </select>
        </div>
      </div>

      <div className="form-pair">
        <div className="field">
          <label>
            Message <span className="muted">(optional)</span>
          </label>

          <input
            className="input"
            name="message"
            maxLength={500}
            placeholder="Add a note for the recipient"
          />
        </div>

        <div className="field share-button-field">
          <button
            className="btn"
            disabled={busy || !documents.length}
          >
            {busy ? 'Sharing…' : 'Share document  →'}
          </button>
        </div>
      </div>

      {!documents.length && (
        <p className="share-hint">
          Upload a document first to share it from your workspace.
        </p>
      )}
    </form>
  );
}
