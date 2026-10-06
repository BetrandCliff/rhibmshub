'use client';

import { useEffect, useRef, useState } from 'react';

type ExistingProfile = { headline: string; expertise: string; bio: string; available: boolean } | null;

export default function MentorApplicationModal({ profile }: { profile: ExistingProfile }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return <>
    <button className="btn" type="button" onClick={() => setOpen(true)}>{profile ? 'Update mentor profile' : 'Become a mentor'}</button>
    <dialog className="job-modal mentor-modal" ref={dialog} onClose={() => setOpen(false)}>
      <div className="job-modal-head"><div><div className="eyebrow">MENTOR DIRECTORY</div><h2>{profile ? 'Apply to be a mentor' : 'Become a mentor'}</h2><p>An administrator will review your application before your profile appears in the directory.</p></div><button className="job-modal-close" type="button" aria-label="Close" onClick={() => setOpen(false)}>×</button></div>
      <form action="/api/mentorship/profile" method="post" className="module-form job-modal-form">
        <label className="module-wide">Profile headline<input className="input" name="headline" required maxLength={120} defaultValue={profile?.headline ?? ''} placeholder="e.g. Research methods and career planning" /></label>
        <label className="module-wide">Areas of expertise<input className="input" name="expertise" required maxLength={240} defaultValue={profile?.expertise ?? ''} placeholder="Separate areas with commas" /></label>
        <label className="module-wide">About your mentorship<textarea className="input" name="bio" rows={4} required maxLength={2000} defaultValue={profile?.bio ?? ''} placeholder="Share your experience and how you support students." /></label>
        <label className="module-checkbox"><input type="checkbox" name="available" value="true" defaultChecked={profile?.available ?? true} /> Available for new mentees</label>
        <div className="job-modal-actions module-wide"><button className="btn secondary" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="btn" type="submit">Submit for approval</button></div>
      </form>
    </dialog>
  </>;
}
