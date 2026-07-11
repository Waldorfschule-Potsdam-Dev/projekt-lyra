/**
 * RichBody – rendert den Notiz-Body mit Markdown-Support.
 *
 * Features:
 *  - URLs (http/https) im Fließtext werden automatisch zu klickbaren
 *    Links – das spart dem Nutzer das manuelle `[..](..)`-Tippen
 *  - Links öffnen in einem neuen Tab (`target="_blank"`,
 *    `rel="noopener noreferrer"`), die App verlassen sie also nicht
 *
 * Der Body ist plain text (mit Markdown-Syntax). Wir nutzen
 * `react-markdown`, das bereits im Projekt verfügbar ist.
 */

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { useTheme } from "./theme";
import type { ThemeTokens } from "./theme-tokens";

/** Props – wir brauchen nur den Body-String. */
interface Props {
  body: string;
}

/**
 * Findet nackte URLs im Text und wrappt sie in Markdown-Link-Syntax.
 *
 * Wird VOR dem React-Markdown-Render aufgerufen, damit react-markdown
 * die URLs ganz normal als `<a>` rendert (mit unserem Custom-Component
 * für `target="_blank"` etc.).
 *
 * Bewusst konservativ: matched nur `http://` und `https://`, nichts
 * hinter `<` (um HTML-Tags nicht zu zerlegen) und nichts hinter
 * Klammern (um bestehende Markdown-Links nicht doppelt zu wrappen).
 */
function autoLinkUrls(text: string): string {
  // Ein URL-Match darf nicht in `](...)` einer bestehenden Markdown-Link
  // landen – das verhindert die Lookbehind-Assertion.
  // HINWEIS: Innerhalb der Character-Class sind `(` und `]` literal,
  // daher brauchen sie kein `\`. Nur `\]` wäre nötig, wenn `]` nicht
  // das erste Zeichen der Klasse wäre – ist es aber, also reicht `[]>`.
  const URL_REGEX = /(?<![(]>)\bhttps?:\/\/[^\s<)]+/g;
  return text.replace(URL_REGEX, (match) => `[${match}](${match})`);
}

/** Inline-Style für einen gerenderten Absatz, abhängig vom Theme. */
function paragraphStyle(theme: ThemeTokens): React.CSSProperties {
  return {
    margin: "0 0 12px 0",
    lineHeight: 1.65,
    color: theme.text,
    fontSize: 16,
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  };
}

export default function RichBody({ body }: Props) {
  const { theme } = useTheme();

  /**
   * Pre-Prozess-Schritt: nackte URLs → Markdown-Links.
   *
   * `useMemo`, damit wir nicht bei jedem Re-Render neu durch
   * den Body regexen (kann bei langen Notizen teuer werden).
   */
  const processedBody = useMemo(() => autoLinkUrls(body ?? ""), [body]);

  /**
   * Custom-Komponenten für React-Markdown.
   *
   * - `a`: öffnet in neuem Tab, keine Referrer-Info
   * - `p`: theme-aware Absatz-Styles
   */
  const components: Components = useMemo(
    () => ({
      a: ({ href, children, ...rest }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: theme.accentStrong,
            textDecoration: "underline",
            textUnderlineOffset: 2,
            wordBreak: "break-word",
          }}
          {...rest}
        >
          {children}
        </a>
      ),
      p: ({ children }) => <p style={paragraphStyle(theme)}>{children}</p>,
      h1: ({ children }) => (
        <h1 style={{ margin: "16px 0 8px", color: theme.text, fontSize: 24, fontWeight: 700 }}>
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 style={{ margin: "14px 0 6px", color: theme.text, fontSize: 20, fontWeight: 600 }}>
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 style={{ margin: "12px 0 4px", color: theme.text, fontSize: 17, fontWeight: 600 }}>
          {children}
        </h3>
      ),
      ul: ({ children }) => (
        <ul style={{ margin: "0 0 12px 20px", color: theme.text, lineHeight: 1.65 }}>{children}</ul>
      ),
      ol: ({ children }) => (
        <ol style={{ margin: "0 0 12px 20px", color: theme.text, lineHeight: 1.65 }}>{children}</ol>
      ),
      li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
      code: ({ children }) => (
        <code
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "0.9em",
            padding: "2px 6px",
            borderRadius: 6,
            background: theme.surfaceElevated,
            color: theme.text,
          }}
        >
          {children}
        </code>
      ),
      blockquote: ({ children }) => (
        <blockquote
          style={{
            margin: "8px 0 12px",
            padding: "8px 14px",
            borderLeft: `3px solid ${theme.accent}`,
            background: theme.surfaceElevated,
            borderRadius: 8,
            color: theme.textMuted,
          }}
        >
          {children}
        </blockquote>
      ),
      hr: () => (
        <hr
          style={{
            border: "none",
            borderTop: `1px solid ${theme.border}`,
            margin: "16px 0",
          }}
        />
      ),
    }),
    [theme],
  );

  if (!body || body.trim() === "") {
    return (
      <p
        style={{
          margin: 0,
          color: theme.textMuted,
          fontStyle: "italic",
          fontSize: 15,
        }}
      >
        Noch nichts geschrieben.
      </p>
    );
  }

  return (
    <div>
      <ReactMarkdown components={components}>{processedBody}</ReactMarkdown>
    </div>
  );
}
