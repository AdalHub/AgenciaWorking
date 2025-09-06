import { useState } from 'react';

interface Props { onClose: () => void; }

const slugify = (str: string) =>
  str.toLowerCase().trim().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-');

export default function JobForm({ onClose }: Props) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    team: '',
    employmentType: '',
    location: '',
  });
  const [posted, setPosted] = useState(() => new Date().toISOString().slice(0,10));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, posted, slug: slugify(form.title) };
    const res = await fetch('/api/jobs.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if (!res.ok) { alert('Failed to add job'); return; }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display:'grid', gap:12 }}>
      <input name="title" placeholder="Job Title" value={form.title} onChange={handleChange} required />
      <input name="team" placeholder="Team" value={form.team} onChange={handleChange} required />
      <input name="employmentType" placeholder="Employment Type" value={form.employmentType} onChange={handleChange} required />
      <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
      <label>Posted Date:
        <input type="date" value={posted} onChange={e=>setPosted(e.target.value)} required />
      </label>
      <button type="submit">Post Job</button>
    </form>
  );
}
