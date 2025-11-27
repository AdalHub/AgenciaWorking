// src/components/Admin/BlogForm.tsx
import React, { useState, useRef } from 'react';
import type { AdminBlog } from './BlogList';
import RichTextEditor from './RichTextEditor';

interface ContentBlock {
  type: 'text' | 'image';
  content?: string; // for text blocks
  url?: string; // for image blocks
}

interface Props {
  initial?: AdminBlog;
  onDone: () => void;
  onCancel: () => void;
}

export default function BlogForm({ initial, onDone, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [author, setAuthor] = useState(initial?.author ?? '');
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail ?? '');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [bodyBlocks, setBodyBlocks] = useState<ContentBlock[]>(() => {
    if (initial?.body) {
      try {
        const parsed = JSON.parse(initial.body);
        return Array.isArray(parsed) ? parsed : [{ type: 'text', content: '' }];
      } catch {
        return [{ type: 'text', content: initial.body }];
      }
    }
    return [{ type: 'text', content: '' }];
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imageInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const isEdit = !!initial?.id;

  // Update form fields when initial data changes
  React.useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? '');
      setAuthor(initial.author ?? '');
      setThumbnail(initial.thumbnail ?? '');
      try {
        const parsed = JSON.parse(initial.body);
        setBodyBlocks(Array.isArray(parsed) ? parsed : [{ type: 'text', content: initial.body }]);
      } catch {
        setBodyBlocks([{ type: 'text', content: initial.body }]);
      }
    } else {
      setTitle('');
      setAuthor('');
      setThumbnail('');
      setBodyBlocks([{ type: 'text', content: '' }]);
    }
  }, [initial]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // Preview thumbnail
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnail(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadThumbnail = async (): Promise<string> => {
    if (!thumbnailFile) {
      return thumbnail; // Return existing thumbnail if no new file
    }

    const formData = new FormData();
    formData.append('image', thumbnailFile);

    const res = await fetch('/api/blogs.php?action=upload_image', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to upload thumbnail');
    }

    const data = await res.json();
    return data.url;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/blogs.php?action=upload_image', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const data = await res.json();
    return data.url;
  };

  const handleAddTextBlock = (index: number) => {
    const newBlocks = [...bodyBlocks];
    newBlocks.splice(index + 1, 0, { type: 'text', content: '' });
    setBodyBlocks(newBlocks);
  };

  const handleAddImageBlock = async (index: number, file: File) => {
    setUploadingImage(index);
    try {
      const url = await uploadImage(file);
      const newBlocks = [...bodyBlocks];
      newBlocks.splice(index + 1, 0, { type: 'image', url });
      setBodyBlocks(newBlocks);
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleImageInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAddImageBlock(index, file);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveBlock = (index: number) => {
    if (bodyBlocks.length === 1) {
      // Don't allow removing the last block
      return;
    }
    const newBlocks = [...bodyBlocks];
    newBlocks.splice(index, 1);
    setBodyBlocks(newBlocks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Upload thumbnail if new file selected
      let finalThumbnail = thumbnail;
      if (thumbnailFile) {
        finalThumbnail = await uploadThumbnail();
      }

      const payload: any = {
        title,
        author,
        thumbnail: finalThumbnail,
        body: JSON.stringify(bodyBlocks),
      };
      
      if (isEdit) {
        payload.id = initial?.id;
      }
      
      const url = isEdit 
        ? '/api/blogs.php?action=update'
        : '/api/blogs.php?action=create';
        
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Failed to save blog');
      }

      onDone();
    } catch (err) {
      console.error('Failed to save blog', err);
      alert('Failed to save blog: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 12,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h4 style={{ margin: 0 }}>{isEdit ? 'Edit blog' : 'New blog'}</h4>

      <input
        required
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: '#ffffff',
          border: '2px solid #e5e7eb',
          borderRadius: 8,
          fontSize: '1rem',
          color: '#111827',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#063591';
          e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e5e7eb';
          e.target.style.boxShadow = 'none';
        }}
      />

      <input
        placeholder="Author (optional)"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: '#ffffff',
          border: '2px solid #e5e7eb',
          borderRadius: 8,
          fontSize: '1rem',
          color: '#111827',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#063591';
          e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e5e7eb';
          e.target.style.boxShadow = 'none';
        }}
      />

      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Thumbnail</span>
        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          style={{ fontSize: '0.875rem' }}
        />
        {thumbnail && (
          <img
            src={thumbnail}
            alt="Thumbnail preview"
            style={{
              maxWidth: '300px',
              maxHeight: '200px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
            }}
          />
        )}
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Body Content</span>
        {bodyBlocks.map((block, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 12,
              background: '#f9fafb',
            }}
          >
            {block.type === 'text' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <RichTextEditor
                  value={block.content || ''}
                  onChange={(value) => {
                    const newBlocks = [...bodyBlocks];
                    newBlocks[index] = { ...block, content: value };
                    setBodyBlocks(newBlocks);
                  }}
                  placeholder="Enter text content..."
                  rows={6}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleAddTextBlock(index)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.875rem',
                      background: '#fff',
                      border: '1px solid #d1d5db',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    + Add Text Block
                  </button>
                  <label style={{
                    padding: '6px 12px',
                    fontSize: '0.875rem',
                    background: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: 4,
                    cursor: uploadingImage === index ? 'wait' : 'pointer',
                    opacity: uploadingImage === index ? 0.5 : 1,
                    display: 'inline-block',
                  }}>
                    {uploadingImage === index ? 'Uploading...' : '+ Add Photo'}
                    <input
                      ref={(el) => { imageInputRefs.current[index] = el; }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageInputChange(index, e)}
                      style={{ display: 'none' }}
                      disabled={uploadingImage === index}
                    />
                  </label>
                  {bodyBlocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBlock(index)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.875rem',
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {block.url && (
                  <img
                    src={block.url}
                    alt="Blog content"
                    style={{
                      width: '100%',
                      maxWidth: '800px',
                      borderRadius: 16,
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
                      margin: '0 auto',
                    }}
                  />
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleAddTextBlock(index)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.875rem',
                      background: '#fff',
                      border: '1px solid #d1d5db',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    + Add Text Block
                  </button>
                  <label style={{
                    padding: '6px 12px',
                    fontSize: '0.875rem',
                    background: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: 4,
                    cursor: uploadingImage === index ? 'wait' : 'pointer',
                    opacity: uploadingImage === index ? 0.5 : 1,
                    display: 'inline-block',
                  }}>
                    {uploadingImage === index ? 'Uploading...' : '+ Add Photo'}
                    <input
                      ref={(el) => { imageInputRefs.current[index] = el; }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageInputChange(index, e)}
                      style={{ display: 'none' }}
                      disabled={uploadingImage === index}
                    />
                  </label>
                  {bodyBlocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBlock(index)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.875rem',
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

