// src/components/Admin/BlogList.tsx
import { useEffect, useState } from 'react';

export type AdminBlog = {
  id: number;
  title: string;
  thumbnail?: string;
  body: string;
  created_at: string;
  updated_at: string;
};

interface Props {
  blogs: AdminBlog[];
  loading?: boolean;
  selectedId: number | null;
  onSelect: (blog: AdminBlog) => void;
  onEdit: (blog: AdminBlog) => void;
  onDelete: (blog: AdminBlog) => void;
}

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

export default function BlogList({
  blogs,
  loading,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  const isMobile = useIsMobile();
  
  if (loading) return <div>Loading blogs…</div>;
  
  // Ensure blogs is always an array
  const blogsArray = Array.isArray(blogs) ? blogs : [];
  
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', width: '100%' }}>
      {blogsArray.length === 0 && (
        <div style={{ padding: 12 }}>No blogs yet. Create one.</div>
      )}
      {blogsArray.map((blog) => (
        <div
          key={blog.id}
          onClick={() => onSelect(blog)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 8,
            padding: '10px 12px',
            background: selectedId === blog.id ? '#eff6ff' : '#fff',
            borderBottom: '1px solid #e5e7eb',
            cursor: 'pointer',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <div style={{ fontWeight: 500, wordBreak: 'break-word' }}>{blog.title}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {new Date(blog.created_at).toLocaleDateString()}
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: 4,
            flexShrink: 0,
            flexDirection: isMobile ? 'row' : 'row',
            width: isMobile ? '100%' : 'auto',
            marginTop: isMobile ? 8 : 0,
          }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(blog); }}
              style={{
                padding: isMobile ? '6px 10px' : '6px 12px',
                fontSize: isMobile ? '0.875rem' : '1rem',
                flex: isMobile ? '1 1 50%' : '0 0 auto',
              }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(blog); }}
              style={{ 
                background: '#fee2e2',
                padding: isMobile ? '6px 10px' : '6px 12px',
                fontSize: isMobile ? '0.875rem' : '1rem',
                flex: isMobile ? '1 1 50%' : '0 0 auto',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

