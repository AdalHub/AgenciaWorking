// src/components/career/ApplicationModal.tsx
import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import {
  Overlay, ApplicationModalContent, CloseButton, ModalTitle,
  ModalForm, ModalInput, ModalTextArea, ModalButton,
  ModalStatusMessage, CheckIconContainer, SuccessMessage, PopupBox
} from './ContactBlockStyles';

interface ApplicationFormShape {
  fullName: string;
  email: string;
  phone: string;
  whyApply: string;
  resume?: FileList;
}

export const ApplicationModal: React.FC<{ jobTitle: string; jobId?: number; onClose: () => void }> = ({ jobTitle, jobId, onClose }) => {
  const [form, setForm] = useState<ApplicationFormShape>({ fullName:'', email:'', phone:'', whyApply:'' });
  const [status, setStatus] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    setForm(prev => ({ ...prev, [name]: files ?? value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const fd = new FormData();
    fd.append('job_id', String(jobId ?? 0));
    fd.append('full_name', form.fullName);
    fd.append('email', form.email);
    fd.append('phone', form.phone);
    fd.append('why_apply', form.whyApply);
    if (form.resume && form.resume[0]) fd.append('resume', form.resume[0]);
    const res = await fetch('/api/applications.php', { method: 'POST', body: fd });
    if (res.ok) { setOk(true); setStatus('Application submitted! We will contact you soon.'); }
    else { const j = await res.json().catch(()=>({error:'Failed'})); setStatus(j.error || 'Failed to submit'); }
  };

  if (ok) {
    return (
      <Overlay>
        <PopupBox>
          <CloseButton onClick={onClose}><X size={24}/></CloseButton>
          <CheckIconContainer><CheckCircle/></CheckIconContainer>
          <SuccessMessage>{status}</SuccessMessage>
        </PopupBox>
      </Overlay>
    );
  }

  return (
    <Overlay>
      <ApplicationModalContent>
        <CloseButton onClick={onClose}><X size={24}/></CloseButton>
        <ModalTitle>Apply for {jobTitle}</ModalTitle>
        <ModalForm onSubmit={onSubmit}>
          <ModalInput name="fullName" placeholder="Full Name" value={form.fullName} onChange={onChange} />
          <ModalInput name="email" placeholder="Email" type="email" value={form.email} onChange={onChange} />
          <ModalInput name="phone" placeholder="Phone Number" value={form.phone} onChange={onChange} />
          <input name="resume" type="file" accept="application/pdf" onChange={onChange} />
          <ModalTextArea name="whyApply" placeholder="Tell us why you're a great fit" rows={5} value={form.whyApply} onChange={onChange}/>
          <ModalButton type="submit">Submit Application</ModalButton>
          {status && <ModalStatusMessage $isSuccess={ok}>{status}</ModalStatusMessage>}
        </ModalForm>
      </ApplicationModalContent>
    </Overlay>
  );
};
