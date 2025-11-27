// src/components/Admin/Blogs.tsx
import { useEffect, useState } from 'react';
import BlogList from './BlogList';
import type { AdminBlog } from './BlogList';
import BlogForm from './BlogForm';

// Hook to detect mobile screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<AdminBlog[]>([]);
  const [selected, setSelected] = useState<AdminBlog | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminBlog | null>(null);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blogs.php?action=list', {
        credentials: 'include',
      });
      const data = await res.json();
      console.log('Loaded blogs:', data);
      
      // Handle error responses
      if (!res.ok || (data.error && !Array.isArray(data))) {
        console.error('Blog list error:', data.error || 'Unknown error');
        setBlogs([]);
        return;
      }
      
      // Ensure data is an array
      const blogsArray = Array.isArray(data) ? data : [];
      setBlogs(blogsArray);
      if (!selected && blogsArray.length > 0) {
        setSelected(blogsArray[0]);
      }
    } catch (err) {
      console.error('Failed to load blogs', err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleCreatedOrUpdated = async () => {
    const editedId = editing?.id;
    setShowForm(false);
    setEditing(null);
    
    setLoading(true);
    try {
      const res = await fetch('/api/blogs.php?action=list', {
        credentials: 'include',
      });
      const data = await res.json();
      
      // Handle error responses
      if (!res.ok || (data.error && !Array.isArray(data))) {
        console.error('Blog list error:', data.error || 'Unknown error');
        setBlogs([]);
        return;
      }
      
      // Ensure data is an array
      const blogsArray = Array.isArray(data) ? data : [];
      setBlogs(blogsArray);
      
      if (editedId) {
        const updated = blogsArray.find((b: AdminBlog) => b.id === editedId);
        if (updated) {
          setSelected(updated);
        } else if (blogsArray.length > 0) {
          setSelected(blogsArray[0]);
        }
      } else if (!selected && blogsArray.length > 0) {
        setSelected(blogsArray[0]);
      }
    } catch (err) {
      console.error('Failed to load blogs', err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: isMobile ? '0 0 32px' : '0 16px 32px',
      boxSizing: 'border-box',
      width: '100%',
      overflowX: 'hidden',
    }}>
      <h2 style={{ marginBottom: '1rem', fontSize: isMobile ? '1.5rem' : '2rem' }}>Admin – Blogs</h2>
      <p style={{ marginBottom: '1.5rem', maxWidth: 700, fontSize: isMobile ? '0.875rem' : '1rem' }}>
        Create and manage blog posts.
      </p>

      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '1.5rem',
        alignItems: 'flex-start',
      }}>
        {/* LEFT: blogs list + buttons */}
        <div style={{ 
          flex: isMobile ? '1 1 100%' : '0 0 300px',
          width: isMobile ? '100%' : 'auto',
          minWidth: 0,
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 12,
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <h3 style={{ margin: 0 }}>Blogs</h3>
            <button 
              onClick={() => { setShowForm(true); setEditing(null); }}
              style={{
                padding: '6px 12px',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
              }}
            >
              + New
            </button>
          </div>

          <BlogList
            blogs={blogs}
            loading={loading}
            selectedId={selected?.id ?? null}
            onSelect={(blog) => setSelected(blog)}
            onEdit={(blog) => {
              setEditing(blog);
              setShowForm(true);
            }}
            onDelete={async (blog) => {
              if (!window.confirm(`Delete blog "${blog.title}"?`)) return;
              try {
                await fetch('/api/blogs.php?action=delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ id: blog.id }),
                });
                if (selected?.id === blog.id) setSelected(null);
                loadBlogs();
              } catch (err) {
                console.error('Delete failed', err);
              }
            }}
          />
        </div>

        {/* RIGHT: edit form (when open) or selected blog preview */}
        <div style={{ 
          flex: isMobile ? '1 1 100%' : 1,
          width: isMobile ? '100%' : 'auto',
          minWidth: 0,
        }}>
          {showForm && (
            <div style={{ marginBottom: 24 }}>
              <BlogForm
                initial={editing ?? undefined}
                onDone={handleCreatedOrUpdated}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            </div>
          )}
          
          {selected && !showForm && (
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 16,
              background: '#fff',
            }}>
              <h3 style={{ marginBottom: 12, wordBreak: 'break-word' }}>
                {selected.title}
              </h3>
              {selected.thumbnail && (
                <img
                  src={selected.thumbnail}
                  alt={selected.title}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                />
              )}
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Created: {new Date(selected.created_at).toLocaleDateString()}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Updated: {new Date(selected.updated_at).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {!selected && !showForm && (
            <p>Select a blog to view details, or create a new one.</p>
          )}
        </div>
      </div>
    </div>
  );
}

