import type { JSX, ReactNode } from "react";

interface MarkdownLineProps {
  content: string;
}

function renderInline(text: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const pushText = (value: string) => {
    if (!value) return;
    tokens.push(<span key={`t-${key++}`}>{value}</span>);
  };

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const codeMatch = remaining.match(/`([^`]+)`/);
    const italicMatch = remaining.match(/(?:^|[^*])\*([^*]+)\*/);

    const candidates: Array<{ index: number; length: number; element: ReactNode }> = [];
    if (boldMatch?.index !== undefined) {
      candidates.push({
        index: boldMatch.index,
        length: boldMatch[0].length,
        element: <strong key={`b-${key++}`}>{boldMatch[1]}</strong>,
      });
    }
    if (codeMatch?.index !== undefined) {
      candidates.push({
        index: codeMatch.index,
        length: codeMatch[0].length,
        element: (
          <code
            key={`c-${key++}`}
            style={{
              backgroundColor: "var(--color-bg)",
              padding: "0 4px",
              borderRadius: "4px",
              fontSize: "0.85em",
            }}
          >
            {codeMatch[1]}
          </code>
        ),
      });
    }
    if (italicMatch?.index !== undefined) {
      const matchStart = italicMatch.index + (italicMatch[0].startsWith("*") ? 0 : 1);
      candidates.push({
        index: matchStart,
        length: italicMatch[0].length - (italicMatch[0].startsWith("*") ? 0 : 1),
        element: <em key={`i-${key++}`}>{italicMatch[1]}</em>,
      });
    }

    if (candidates.length === 0) {
      pushText(remaining);
      break;
    }

    candidates.sort((a, b) => a.index - b.index);
    const next = candidates[0]!;
    pushText(remaining.slice(0, next.index));
    tokens.push(next.element);
    remaining = remaining.slice(next.index + next.length);
  }

  return tokens;
}

export function MarkdownLine({ content }: MarkdownLineProps) {
  return <>{renderInline(content)}</>;
}

interface MarkdownRendererProps {
  source: string;
  className?: string;
}

export function MarkdownRenderer({ source, className }: MarkdownRendererProps) {
  const blocks: JSX.Element[] = [];
  const lines = source.split(/\r?\n/);
  let buffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (buffer.length === 0) return;
    const text = buffer.join(" ");
    blocks.push(
      <p key={`p-${blocks.length}`} style={{ margin: "0 0 12px 0", lineHeight: 1.6 }}>
        <MarkdownLine content={text} />
      </p>,
    );
    buffer = [];
  };

  const flushList = () => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} style={{ margin: "0 0 12px 0", paddingLeft: "20px" }}>
        {listBuffer.map((item, idx) => (
          <li key={idx} style={{ marginBottom: "4px", lineHeight: 1.6 }}>
            <MarkdownLine content={item} />
          </li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");

    if (line.startsWith("### ")) {
      flushList();
      flushParagraph();
      blocks.push(
        <h4 key={`h4-${blocks.length}`} style={{ margin: "16px 0 6px 0", fontSize: "0.95rem", fontWeight: 600 }}>
          <MarkdownLine content={line.slice(4)} />
        </h4>,
      );
    } else if (line.startsWith("## ")) {
      flushList();
      flushParagraph();
      blocks.push(
        <h3
          key={`h3-${blocks.length}`}
          style={{
            margin: "20px 0 8px 0",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--color-text)",
          }}
        >
          <MarkdownLine content={line.slice(3)} />
        </h3>,
      );
    } else if (line.startsWith("# ")) {
      flushList();
      flushParagraph();
      blocks.push(
        <h2
          key={`h2-${blocks.length}`}
          style={{ margin: "20px 0 10px 0", fontSize: "1.1rem", fontWeight: 700 }}
        >
          <MarkdownLine content={line.slice(2)} />
        </h2>,
      );
    } else if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      listBuffer.push(line.replace(/^[-*]\s+/, ""));
    } else if (line.trim() === "") {
      flushList();
      flushParagraph();
    } else {
      flushList();
      buffer.push(line);
    }
  }

  flushList();
  flushParagraph();

  return (
    <div className={className} style={{ color: "var(--color-text)" }}>
      {blocks}
    </div>
  );
}
