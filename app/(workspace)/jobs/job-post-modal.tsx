'use client';

import { useEffect, useRef, useState } from 'react';

type Department = { id: string; name: string };

export default function JobPostModal({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return <>
    <button className="btn" type="button" onClick={() => setOpen(true)}>Post job</button>
    <dialog className="job-modal" ref={dialog} onClose={() => setOpen(false)}>
      <div className="job-modal-head"><div><div className="eyebrow">CAREER OPPORTUNITY</div><h2>Post a job</h2><p>Share an opportunity with students and colleagues.</p></div><button className="job-modal-close" type="button" aria-label="Close" onClick={() => setOpen(false)}>×</button></div>
      <form action="/api/jobs" method="post" className="module-form job-modal-form">
        <label>Job title<input className="input" name="title" required maxLength={120} placeholder="e.g. Graduate Research Assistant" /></label>
        <label>Organization<input className="input" name="organization" required maxLength={120} placeholder="Organization or employer" /></label>
        <label>Department<select name="departmentId" defaultValue=""><option value="">Campus-wide</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Type<select name="employmentType"><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Volunteer</option></select></label>
        <label>Location<input className="input" name="location" maxLength={120} placeholder="City, remote, or hybrid" /></label>
        <label>Apply link<input className="input" type="url" name="applicationUrl" placeholder="https://…" /></label>
        <label className="module-wide">Description<textarea className="input" name="description" rows={4} required maxLength={6000} placeholder="Describe the role and how to apply." /></label>
        <label>Application deadline<input className="input" type="date" name="deadline" /></label>
        <div className="job-modal-actions module-wide"><button className="btn secondary" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="btn" type="submit">Publish job</button></div>
      </form>
    </dialog>
  </>;
}
