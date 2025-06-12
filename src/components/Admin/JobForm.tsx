// ✅ src/components/admin/JobForm.tsx
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface Props {
  onClose: () => void;
}

// 🔧 Slugify function to generate slugs from job titles
const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

export default function JobForm({ onClose }: Props) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    team: '',
    employment: '',
    location: '',
  });

  const [postedDate, setPostedDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newJob = {
      title: form.title,
      description: form.description,
      team: form.team,
      employmentType: form.employment,
      location: form.location,
      slug: slugify(form.title),
      posted: postedDate,
    };

    try {
      await addDoc(collection(db, 'jobs'), newJob);
      onClose();
    } catch (err) {
      console.error('Failed to add job:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input
        name="title"
        placeholder="Job Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <input
        name="team"
        placeholder="Team"
        value={form.team}
        onChange={handleChange}
        required
      />
      <input
        name="employment"
        placeholder="Employment Type"
        value={form.employment}
        onChange={handleChange}
        required
      />
      <input
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        required
      />
      <label>
        Posted Date:
        <input
          type="date"
          value={postedDate}
          onChange={(e) => setPostedDate(e.target.value)}
          required
        />
      </label>

      <button type="submit">Post Job</button>
    </form>
  );
}
