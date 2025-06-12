import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function JobForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    employmentType: '',
    team: '',
    location: '',
    posted: '',
    slug: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const jobData = {
        ...form,
        posted: form.posted || new Date().toISOString().split('T')[0],
        slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(db, 'jobs'), jobData);
      alert('Job posted!');
      setForm({ title: '', description: '', employmentType: '', team: '', location: '', posted: '', slug: '' });
    } catch (err) {
      console.error('Error posting job:', err);
      alert('Failed to post job.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: 500, margin: '2rem auto' }}>
      <input name="title" placeholder="Job Title" value={form.title} onChange={handleChange} required />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
      <input name="employmentType" placeholder="Employment Type" value={form.employmentType} onChange={handleChange} required />
      <input name="team" placeholder="Team" value={form.team} onChange={handleChange} required />
      <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
      <input name="posted" type="date" value={form.posted} onChange={handleChange} />
      <button type="submit">Submit Job</button>
    </form>
  );
}
