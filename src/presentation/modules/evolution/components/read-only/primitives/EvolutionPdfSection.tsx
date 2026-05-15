import type { ReactNode } from "react";

interface EvolutionPdfSectionProps {
  number: number | string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  noBody?: boolean;
}

export function EvolutionPdfSection({
  number,
  title,
  subtitle,
  children,
  noBody = false,
}: EvolutionPdfSectionProps) {
  return (
    <section className="em-pdf-section">
      <header className="em-pdf-section__header">
        <span className="em-pdf-section__number">{number}</span>
        <div className="em-pdf-section__titles">
          <span className="em-pdf-section__title">{title}</span>
          {subtitle ? (
            <span className="em-pdf-section__subtitle">{subtitle}</span>
          ) : null}
        </div>
      </header>
      {noBody ? (
        <div className="em-pdf-section__body em-pdf-section__body--empty">
          {children}
        </div>
      ) : (
        <div className="em-pdf-section__body">{children}</div>
      )}
    </section>
  );
}
