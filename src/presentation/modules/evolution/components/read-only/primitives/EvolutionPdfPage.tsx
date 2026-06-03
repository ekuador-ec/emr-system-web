import type { ReactNode } from "react";

interface EvolutionPdfPageProps {
  pageNumber: number;
  totalPages: number;
  children: ReactNode;
  footerLabel?: string;
}

export function EvolutionPdfPage({
  pageNumber,
  totalPages,
  children,
  footerLabel = "Atención de Emergencia",
}: EvolutionPdfPageProps) {
  return (
    <article className="em-pdf-page">
      <div className="em-pdf-page__content">{children}</div>
      <footer className="em-pdf-page__footer">
        <span className="em-pdf-page__footer-label">{footerLabel}</span>
        <span className="em-pdf-page__footer-pagination">
          Hoja {pageNumber} de {totalPages}
        </span>
      </footer>
    </article>
  );
}
