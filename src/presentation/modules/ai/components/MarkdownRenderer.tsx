import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import "@/presentation/modules/ai/components/MarkdownRenderer.css";

interface MarkdownRendererProps {
  source: string;
  className?: string;
}

const COMPONENTS: Components = {
  h1: ({ children, ...props }) => (
    <h2 className="ai-md__h1" {...props}>
      {children}
    </h2>
  ),
  h2: ({ children, ...props }) => (
    <h3 className="ai-md__h2" {...props}>
      {children}
    </h3>
  ),
  h3: ({ children, ...props }) => (
    <h4 className="ai-md__h3" {...props}>
      {children}
    </h4>
  ),
  h4: ({ children, ...props }) => (
    <h5 className="ai-md__h4" {...props}>
      {children}
    </h5>
  ),
  p: ({ children, ...props }) => (
    <p className="ai-md__p" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="ai-md__ul" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="ai-md__ol" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="ai-md__li" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="ai-md__quote" {...props}>
      {children}
    </blockquote>
  ),
  a: ({ children, href, ...props }) => (
    <a
      className="ai-md__link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) {
      return (
        <pre className="ai-md__pre">
          <code className={`ai-md__code-block ${className ?? ""}`} {...props}>
            {children}
          </code>
        </pre>
      );
    }
    return (
      <code className="ai-md__code-inline" {...props}>
        {children}
      </code>
    );
  },
  table: ({ children, ...props }) => (
    <div className="ai-md__table-wrap">
      <table className="ai-md__table" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="ai-md__thead" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th className="ai-md__th" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="ai-md__td" {...props}>
      {children}
    </td>
  ),
  hr: (props) => <hr className="ai-md__hr" {...props} />,
};

export function MarkdownRenderer({ source, className }: MarkdownRendererProps) {
  return (
    <div className={`ai-md ${className ?? ""}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
