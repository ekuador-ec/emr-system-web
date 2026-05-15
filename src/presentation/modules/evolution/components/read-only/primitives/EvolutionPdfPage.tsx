import type { ReactNode } from "react";

interface EvolutionPdfPageProps {
  pageNumber: number;
  totalPages: number;
  children: ReactNode;
}

export function EvolutionPdfPage({
  pageNumber,
  totalPages,
  children,
}: EvolutionPdfPageProps) {
  return (
    <article className="em-pdf-page">
      <div className="em-pdf-page__content">{children}</div>
      <footer className="em-pdf-page__footer">
        <span className="em-pdf-page__footer-label">Atención de Emergencia</span>
        <span className="em-pdf-page__footer-pagination">
          Hoja {pageNumber} de {totalPages}
        </span>
      </footer>
    </article>
  );
}
