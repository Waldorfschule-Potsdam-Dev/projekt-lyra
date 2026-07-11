import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

type TableData = {
  headers: string[];
  rows: string[][];
};

type Segment =
  | { type: 'md'; content: string }
  | { type: 'table'; data: TableData };

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

const SEPARATOR_RE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/;

function parseMarkdownWithTables(md: string): Segment[] {
  const lines = md.split('\n');
  const segments: Segment[] = [];
  let buffer: string[] = [];
  let i = 0;

  const flush = () => {
    if (buffer.length > 0) {
      const text = buffer.join('\n').replace(/\n{3,}/g, '\n\n').trim();
      if (text) segments.push({ type: 'md', content: text });
      buffer = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const isTableStart =
      line.trim().startsWith('|') &&
      line.trim().endsWith('|') &&
      i + 1 < lines.length &&
      SEPARATOR_RE.test(lines[i + 1]);

    if (isTableStart) {
      const headers = parseTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t.startsWith('|') && t.endsWith('|')) {
          rows.push(parseTableRow(lines[i]));
          i++;
        } else {
          break;
        }
      }
      flush();
      segments.push({ type: 'table', data: { headers, rows } });
    } else {
      buffer.push(line);
      i++;
    }
  }
  flush();
  return segments;
}

function MarkdownTable({ data, dark }: { data: TableData; dark: boolean }) {
  return (
    <div style={{ overflowX: 'auto', margin: '14px 0', borderRadius: 10, border: dark ? '1px solid #262626' : '1px solid #E5E5EA' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 13,
        lineHeight: 1.5,
      }}>
        <thead>
          <tr style={{ backgroundColor: dark ? '#161616' : '#F8F8FA' }}>
            {data.headers.map((h, i) => (
              <th key={i} style={{
                padding: '8px 12px',
                textAlign: 'left',
                fontWeight: 600,
                color: dark ? '#FFFFFF' : '#1C1C1E',
                borderBottom: dark ? '1px solid #262626' : '1px solid #E5E5EA',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? (dark ? '#0E0E0E' : '#fff') : (dark ? '#161616' : '#FAFAFA') }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '8px 12px',
                  color: dark ? '#E3E3E3' : '#1C1C1E',
                  borderBottom: i === data.rows.length - 1 ? 'none' : (dark ? '1px solid #262626' : '1px solid #F0F0F2'),
                  verticalAlign: 'top',
                }}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <span>{children}</span>,
                      a: ({ children }) => <span style={{ color: dark ? '#1A73E8' : '#0F9D58' }}>{children}</span>,
                    }}
                  >{cell}</ReactMarkdown>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const getMdComponents = (dark: boolean): Components => ({
  h1: ({ children }) => (
    <h1 style={{
      fontSize: 22,
      fontWeight: 700,
      color: dark ? '#FFFFFF' : '#1C1C1E',
      margin: '0 0 6px',
      letterSpacing: -0.3,
    }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{
      fontSize: 17,
      fontWeight: 600,
      color: dark ? '#FFFFFF' : '#1C1C1E',
      margin: '24px 0 8px',
      paddingTop: 4,
    }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{
      fontSize: 15,
      fontWeight: 600,
      color: dark ? '#E3E3E3' : '#3A3A3C',
      margin: '16px 0 6px',
    }}>{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 style={{
      fontSize: 14,
      fontWeight: 600,
      color: dark ? '#E3E3E3' : '#3A3A3C',
      margin: '12px 0 4px',
    }}>{children}</h4>
  ),
  p: ({ children }) => (
    <p style={{
      margin: '0 0 10px',
      fontSize: 14,
      lineHeight: 1.65,
      color: dark ? '#E3E3E3' : '#1C1C1E',
    }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{
      margin: '0 0 10px',
      paddingLeft: 22,
      fontSize: 14,
      lineHeight: 1.65,
      color: dark ? '#E3E3E3' : '#1C1C1E',
    }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{
      margin: '0 0 10px',
      paddingLeft: 22,
      fontSize: 14,
      lineHeight: 1.65,
      color: dark ? '#E3E3E3' : '#1C1C1E',
    }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: 3 }}>{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      margin: '12px 0',
      padding: '8px 14px',
      borderLeft: '3px solid #F29900',
      backgroundColor: dark ? '#2A1F08' : '#FFF8EE',
      color: dark ? '#E3E3E3' : '#3A3A3C',
      fontStyle: 'italic',
      fontSize: 13,
      borderRadius: '0 8px 8px 0',
    }}>{children}</blockquote>
  ),
  hr: () => (
    <hr style={{
      border: 'none',
      borderTop: dark ? '1px solid #262626' : '1px solid #E5E5EA',
      margin: '18px 0',
    }} />
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) {
      return (
        <code style={{
          display: 'block',
          padding: '10px 12px',
          backgroundColor: dark ? '#161616' : '#F2F2F7',
          color: dark ? '#E3E3E3' : '#1C1C1E',
          borderRadius: 8,
          fontSize: 12,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          overflowX: 'auto',
          whiteSpace: 'pre',
        }}>{children}</code>
      );
    }
    return (
      <code style={{
        padding: '1px 6px',
        backgroundColor: dark ? '#161616' : '#F2F2F7',
        color: dark ? '#E3E3E3' : '#1C1C1E',
        borderRadius: 4,
        fontSize: 12.5,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }}>{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre style={{
      margin: '10px 0',
      padding: 0,
      backgroundColor: 'transparent',
    }}>{children}</pre>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: dark ? '#FFFFFF' : '#1C1C1E' }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ fontStyle: 'italic' }}>{children}</em>
  ),
  a: ({ children, href }) => (
    <a href={href} style={{ color: dark ? '#1A73E8' : '#0F9D58', textDecoration: 'underline' }}>{children}</a>
  ),
});

export function MarkdownRenderer({ content, dark = false }: { content: string; dark?: boolean }) {
  const segments = parseMarkdownWithTables(content);
  const mdComponents = getMdComponents(dark);

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {segments.map((seg, idx) => {
        if (seg.type === 'md') {
          return (
            <ReactMarkdown key={idx} components={mdComponents}>
              {seg.content}
            </ReactMarkdown>
          );
        }
        return <MarkdownTable key={idx} data={seg.data} dark={dark} />;
      })}
    </div>
  );
}
