// src/utils/markdownToHtml.ts
// Simple markdown to HTML converter for service descriptions

export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Process line by line to handle lists and headers properly
  const lines = html.split('\n');
  const processed: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const tag = listType === 'ul' ? 'ul' : 'ol';
      processed.push(`<${tag}>${listItems.join('')}</${tag}>`);
      listItems = [];
      inList = false;
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Headers (must be at start of line)
    if (line.match(/^###\s+/)) {
      flushList();
      line = line.replace(/^###\s+(.*)$/, '<h3>$1</h3>');
      processed.push(line);
      continue;
    }
    if (line.match(/^##\s+/)) {
      flushList();
      line = line.replace(/^##\s+(.*)$/, '<h2>$1</h2>');
      processed.push(line);
      continue;
    }
    if (line.match(/^#\s+/)) {
      flushList();
      line = line.replace(/^#\s+(.*)$/, '<h1>$1</h1>');
      processed.push(line);
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s+/)) {
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      line = line.replace(/^\d+\.\s+(.*)$/, '$1');
      // Process inline formatting
      line = processInlineFormatting(line);
      listItems.push(`<li>${line}</li>`);
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s+/)) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      line = line.replace(/^[-*]\s+(.*)$/, '$1');
      // Process inline formatting
      line = processInlineFormatting(line);
      listItems.push(`<li>${line}</li>`);
      continue;
    }

    // Empty line - flush list and add paragraph break
    if (!line) {
      flushList();
      processed.push('');
      continue;
    }

    // Regular line - flush list first
    flushList();

    // Process inline formatting
    line = processInlineFormatting(line);
    processed.push(line);
  }

  flushList();

  // Join lines and create paragraphs
  html = processed.join('\n');

  // Split by double newlines to create paragraphs
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map((para) => {
      para = para.trim();
      if (!para) return '';
      // Don't wrap if it's already a block element
      if (
        para.startsWith('<h') ||
        para.startsWith('<ul') ||
        para.startsWith('<ol') ||
        para.startsWith('<li')
      ) {
        return para;
      }
      return `<p>${para}</p>`;
    })
    .join('\n');

  // Convert single newlines within paragraphs to <br>
  html = html.replace(/(<p>.*?)<br \/>/g, '$1');
  html = html.replace(/\n/g, '<br />');
  html = html.replace(/(<p>.*?)<br \/>(.*?<\/p>)/g, (_match, p1, p2) => {
    return p1 + p2.replace(/<br \/>/g, ' ');
  });

  return html;
}

function processInlineFormatting(text: string): string {
  // Links [text](url) - do this first
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Bold **text** or __text__
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic *text* or _text_ (but not if it's part of **)
  text = text.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  text = text.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, '<em>$1</em>');

  return text;
}

