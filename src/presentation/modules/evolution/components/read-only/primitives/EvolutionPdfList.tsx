import type { ReactNode } from "react";

interface EvolutionPdfListProps {
  title?: string;
  emptyMessage?: string;
  items: ReactNode[];
  className?: string;
}

export function EvolutionPdfList({
  title,
  emptyMessage = "Sin registros",
  items,
  className,
}: EvolutionPdfListProps) {
  const classes = ["em-pdf-list", className || ""].filter(Boolean).join(" ");

  if (items.length === 0) {
    return (
      <div className={`${classes} em-pdf-list--empty`}>
        {title ? <span className="em-pdf-list__title">{title}</span> : null}
        <span className="em-pdf-list__empty">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className={classes}>
      {title ? <span className="em-pdf-list__title">{title}</span> : null}
      <ul className="em-pdf-list__items">
        {items.map((item, index) => (
          <li key={index} className="em-pdf-list__item">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
