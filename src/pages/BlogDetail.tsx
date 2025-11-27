// src/pages/BlogDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';
import { markdownToHtml } from '../utils/markdownToHtml';

interface ContentBlock {
  type: 'text' | 'image';
  content?: string;
  url?: string;
}

interface Blog {
  id: number;
  title: string;
  author?: string;
  thumbnail?: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBlog = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/blogs.php?action=get&id=${id}`);
        if (res.status === 404) {
          setBlog(null);
          return;
        }
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        console.error('Failed to load blog', err);
      } finally {
        setLoading(false);
      }
    };
    loadBlog();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: '80px', textAlign: 'center' }}>
          <p>Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return <Navigate to="/blog" replace />;
  }

  let bodyBlocks: ContentBlock[] = [];
  try {
    const parsed = JSON.parse(blog.body);
    bodyBlocks = Array.isArray(parsed) ? parsed : [{ type: 'text', content: blog.body }];
  } catch {
    bodyBlocks = [{ type: 'text', content: blog.body }];
  }

  return (
    <>
      <Header />
      <main style={{
        minHeight: '65vh',
        paddingTop: '80px',
        paddingBottom: '4rem',
        maxWidth: 1000,
        margin: '0 auto',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}>
        <button
          onClick={() => navigate('/blog')}
          style={{
            marginBottom: '2rem',
            padding: '0.5rem 1rem',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Blog
        </button>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          marginBottom: '1rem',
        }}>
          {blog.title}
        </h1>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '2rem',
        }}>
          {blog.author && (
            <p style={{
              fontSize: '1rem',
              color: '#374151',
              fontWeight: 500,
              margin: 0,
            }}>
              Author: {blog.author}
            </p>
          )}
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0,
          }}>
            {new Date(blog.created_at).toLocaleDateString()}
          </p>
        </div>

        {blog.thumbnail && (
          <img
            src={blog.thumbnail}
            alt={blog.title}
            style={{
              width: '100%',
              borderRadius: 16,
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
              marginBottom: '2.5rem',
            }}
          />
        )}

        <div style={{
          maxWidth: 640,
          margin: '0 auto',
        }}>
          {bodyBlocks.map((block, index) => (
            <div key={index} style={{ marginBottom: '2rem' }}>
              {block.type === 'text' ? (
                <div
                  style={{
                    fontSize: '1.05rem',
                    lineHeight: 1.7,
                    textAlign: 'left',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(block.content || ''),
                  }}
                />
              ) : (
                <img
                  src={block.url}
                  alt="Blog content"
                  style={{
                    width: '100%',
                    borderRadius: 16,
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
                    margin: '0 auto',
                    display: 'block',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

