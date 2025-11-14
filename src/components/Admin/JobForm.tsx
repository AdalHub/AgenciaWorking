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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#ffffff',
    border: '2px solid #e5e7eb',
    borderRadius: 8,
    fontSize: '1rem',
    color: '#111827',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#063591';
    e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.boxShadow = 'none';
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display:'grid', gap:12 }}>
      <input
        name="title"
        placeholder="Job Title"
        value={form.title}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={inputStyle}
        required
      />
      <input
        name="team"
        placeholder="Team"
        value={form.team}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={inputStyle}
        required
      />
      <input
        name="employmentType"
        placeholder="Employment Type"
        value={form.employmentType}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={inputStyle}
        required
      />
      <input
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={inputStyle}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={textareaStyle}
        required
      />
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>Posted Date:</span>
        <input
          type="date"
          value={posted}
          onChange={e=>setPosted(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={inputStyle}
          required
        />
      </label>
      <button type="submit">Post Job</button>
    </form>
  );
}
