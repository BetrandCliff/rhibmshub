
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DocumentOption = { id: string; title: string; originalName: string; courseId: string | null };
type Option = { id: string; name: string };
type Person = Option & { email: string; staffPosition: string | null };

export default function ShareFileForm({
  documents,
  offices,
  people,
}: {
  documents: DocumentOption[];
  offices: Option[];
  people: Person[];
}) {
  const [source, setSource] = useState<'uploaded' | 'computer'>(documents.length ? 'uploaded' : 'computer');
  const [targetType, setTargetType] = useState<'USER' | 'OFFICE'>('USER');
  const [documentId, setDocumentId] = useState('');
  const [documentSearch, setDocumentSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const courseRecipientsOnly = source === 'uploaded' && Boolean(documents.find((document) => document.id === documentId)?.courseId);
  const eligiblePeople = courseRecipientsOnly ? people.filter((person) => /^(hod\b|head\s+of\s+department\b|dean\b)/i.test(person.staffPosition?.trim() ?? '')) : people;
  const matchingDocuments = documents.filter((document) =>
    document.id === documentId || `${document.title} ${document.originalName}`.toLowerCase().includes(documentSearch.trim().toLowerCase()),
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);

    const element = e.currentTarget;
    const values = new FormData(element);

    try {
      let selectedDocumentId = values.get('documentId');

      if (source === 'computer') {
        const file = values.get('file');
        if (!(file instanceof File) || !file.size) {
          setError('Choose a file from your computer first.');
          setBusy(false);
          return;
        }

        const upload = new FormData();
        upload.set('file', file);
        upload.set('title', file.name.replace(/\.[^.]+$/, '') || file.name);
        const uploadResponse = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: upload,
        });
        const uploadResult = await uploadResponse.json().catch(() => ({}));
        if (!uploadResponse.ok || typeof uploadResult.id !== 'string') {
          setError(uploadResult.error || 'The file could not be uploaded.');
          setBusy(false);
          return;
        }
        selectedDocumentId = uploadResult.id;
      }

      const body = {
        documentId: selectedDocumentId,
      targetType,
      ...(targetType === 'USER'
        ? { recipientUserId: values.get('recipient') }
        : { recipientOfficeId: values.get('recipient') }),
      permission: values.get('permission'),
      message: values.get('message'),
    };

      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(source === 'computer'
          ? `The file was uploaded, but could not be shared: ${data.error || 'Please try again.'} It is now in your uploaded files.`
          : data.error || 'The document could not be shared.');
        if (source === 'computer') router.refresh();
        setBusy(false);
        return;
      }

      element.reset();
      setSource(documents.length ? 'uploaded' : 'computer');
      setDocumentId('');
      setDocumentSearch('');
      setTargetType('USER');
      setSuccess('The document is now shared with the selected recipient.');
      setBusy(false);
      router.refresh();
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
      setBusy(false);
    }
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
          <label>Document source</label>
          <select
            value={source}
            onChange={(event) => {
              setSource(event.target.value as 'uploaded' | 'computer');
              setDocumentId('');
              setTargetType('USER');
            }}
          >
            <option value="uploaded">Choose an uploaded document</option>
            <option value="computer">Upload a file from my computer</option>
          </select>

          {source === 'uploaded' ? <>
          <label htmlFor="document-search">Find an uploaded document</label>
          <input
            className="input"
            id="document-search"
            type="search"
            value={documentSearch}
            onChange={(event) => setDocumentSearch(event.target.value)}
            placeholder="Search by title or file name"
            disabled={!documents.length}
          />
          <label htmlFor="documentId">Choose a document</label>

          <select
            id="documentId"
            name="documentId"
            required
            value={documentId}
            onChange={(event) => { setDocumentId(event.target.value); setTargetType('USER'); }}
          >
            <option value="" disabled>
              Select an uploaded file
            </option>

            {matchingDocuments.map((document) => (
              <option value={document.id} key={document.id}>
                {document.title} — {document.originalName}
              </option>
            ))}
          </select>
          {documents.length > 0 && matchingDocuments.length === 0 && (
            <small className="muted">No uploaded files match that search.</small>
          )}
          {!documents.length && <small className="muted">You have no uploaded documents yet. Choose the computer option to upload one.</small>}
          </> : <>
            <label htmlFor="share-file">Choose a file from your computer</label>
            <input className="input" id="share-file" name="file" type="file" accept=".pdf,.doc,.docx" required />
            <small className="muted">PDF and Word documents are supported.</small>
          </>}
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
            {!courseRecipientsOnly && <option value="OFFICE">An office</option>}
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
              ? eligiblePeople.map((person) => (
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
            disabled={busy || (source === 'uploaded' && !documents.length)}
          >
            {busy ? 'Sharing…' : 'Share document  →'}
          </button>
        </div>
      </div>

      {!documents.length && (
        <p className="share-hint">
          No uploaded documents are available to share yet. Upload a document first.
        </p>
      )}
      {courseRecipientsOnly && <p className="share-hint">Course materials can only be shared directly with HODs and Deans.</p>}
    </form>
  );
}
