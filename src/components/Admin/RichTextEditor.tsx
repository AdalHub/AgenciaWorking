// src/components/Admin/RichTextEditor.tsx
import { useRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function RichTextEditor({ value, onChange, placeholder, rows = 8 }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    let newText: string;
    if (selectedText) {
      // If text is selected, wrap it
      newText = beforeText + before + selectedText + after + afterText;
      onChange(newText);
      // Restore selection
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length
        );
      }, 0);
    } else {
      // Insert markdown at cursor
      newText = beforeText + before + after + afterText;
      onChange(newText);
      // Position cursor between the markers
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length);
      }, 0);
    }
  };

  const insertHeading = (level: number) => {
    insertMarkdown('#'.repeat(level) + ' ', '');
  };

  const insertBold = () => {
    insertMarkdown('**', '**');
  };

  const insertItalic = () => {
    insertMarkdown('*', '*');
  };

  const insertList = (ordered: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const line = value.substring(
      lineStart,
      lineEnd === -1 ? value.length : lineEnd
    );

    const prefix = ordered ? '1. ' : '- ';
    const newLine = prefix + line.trim();
    const newText =
      value.substring(0, lineStart) + newLine + value.substring(lineEnd === -1 ? value.length : lineEnd);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        lineStart + newLine.length,
        lineStart + newLine.length
      );
    }, 0);
  };

  const insertLink = () => {
    insertMarkdown('[', '](url)');
  };

  const insertLineBreak = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + '\n\n' + value.substring(start);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2);
    }, 0);
  };

  return (
    <div
      style={{
        border: '2px solid #e5e7eb',
        borderRadius: 8,
        background: '#fff',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '8px',
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => insertHeading(1)}
          title="Heading 1"
          style={{
            padding: '4px 8px',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#111827',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertHeading(2)}
          title="Heading 2"
          style={{
            padding: '4px 8px',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#111827',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertHeading(3)}
          title="Heading 3"
          style={{
            padding: '4px 8px',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#111827',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          H3
        </button>
        <div style={{ width: '1px', height: '20px', background: '#d1d5db', margin: '0 4px' }} />
        <button
          type="button"
          onClick={insertBold}
          title="Bold"
          style={{
            padding: '4px 8px',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#111827',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={insertItalic}
          title="Italic"
          style={{
            padding: '4px 8px',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontStyle: 'italic',
            color: '#111827',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          <em>I</em>
        </button>
        <div style={{ width: '1px', height: '20px', background: '#d1d5db', margin: '0 4px' }} />
        <button
          type="button"
          onClick={() => insertList(false)}
          title="Bullet List"
          style={{
            padding: '4px 8px',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: '#111827',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => insertList(true)}
          title="Numbered List"
          style={{
            padding: '4px 8px',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: '#111827',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          1.
        </button>
        <button
          type="button"
          onClick={insertLink}
          title="Link"
          style={{
            padding: '4px 8px',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: '#111827',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          🔗
        </button>
        <div style={{ width: '1px', height: '20px', background: '#d1d5db', margin: '0 4px' }} />
        <button
          type="button"
          onClick={insertLineBreak}
          title="New Paragraph"
          style={{
            padding: '4px 8px',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: '#111827',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          ¶
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: '#ffffff',
          border: 'none',
          fontSize: '1rem',
          color: '#111827',
          boxSizing: 'border-box',
          resize: 'vertical',
          fontFamily: 'inherit',
          outline: 'none',
        }}
        onFocus={(e) => {
          const container = e.target.closest('div');
          if (container) {
            (container as HTMLElement).style.borderColor = '#063591';
            (container as HTMLElement).style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
          }
        }}
        onBlur={(e) => {
          const container = e.target.closest('div');
          if (container) {
            (container as HTMLElement).style.borderColor = '#e5e7eb';
            (container as HTMLElement).style.boxShadow = 'none';
          }
        }}
      />
      <div
        style={{
          padding: '8px 12px',
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          fontSize: '0.75rem',
          color: '#6b7280',
        }}
      >
        Use the toolbar buttons above to format your text. Supports markdown syntax: **bold**, *italic*, # headings, lists, and links.
      </div>
    </div>
  );
}

