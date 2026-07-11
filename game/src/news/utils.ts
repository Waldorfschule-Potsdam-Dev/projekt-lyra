import type { Article } from './data';

export type Segment = { type: 'text' | 'speech'; content: string };

const QUOTE_REGEX = /\u201E[^\u201C]+/g;

export function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  QUOTE_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = QUOTE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    const before = text.slice(0, match.index);
    const atBoundary = before.trim() === '' || /[.!?]\s+$/.test(before);
    segments.push({ type: atBoundary ? 'speech' : 'text', content: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return segments;
}

export function isLetterFormat(article: Article): boolean {
  return article.body.length > 0 && /^Liebe Redaktion\b/.test(article.body[0]);
}

export function splitSalutation(text: string): { salutation: string; rest: string } | null {
  const match = text.match(/^(Liebe Redaktion,\s*)/);
  return match ? { salutation: match[1].trim(), rest: text.slice(match[1].length) } : null;
}
