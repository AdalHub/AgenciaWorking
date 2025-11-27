// src/pages/BlogList.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

interface Blog {
  id: number;
  title: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const res = await fetch('/api/blogs.php?action=list');
        const data = await res.json();
        
        // Ensure data is an array
        const blogsArray = Array.isArray(data) ? data : [];
        setBlogs(blogsArray);
      } catch (err) {
        console.error('Failed to load blogs', err);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, []);

  return (
    <>
      <Header />
      <main style={{
        minHeight: '65vh',
        paddingTop: '80px',
        paddingBottom: '4rem',
        maxWidth: 1200,
        margin: '0 auto',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          textAlign: 'center',
          marginBottom: '3rem',
        }}>
          Blog
        </h1>

        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No blog posts yet. Check back soon!</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {blogs.map((blog) => (
              <div
                key={blog.id}
                onClick={() => navigate(`/blog/${blog.id}`)}
                style={{
                  cursor: 'pointer',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#fff',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {blog.thumbnail && (
                  <img
                    src={blog.thumbnail}
                    alt={blog.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <div style={{ padding: '1.5rem' }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    marginBottom: '0.5rem',
                    marginTop: 0,
                  }}>
                    {blog.title}
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0,
                  }}>
                    {new Date(blog.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

