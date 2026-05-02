export interface EvolutionDateRange {
  startDate: string;
  endDate: string;
}

const evolutionDateFormatter = new Intl.DateTimeFormat("es-EC", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getRecentEvolutionDateRange(): EvolutionDateRange {
  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(endDate.getDate() - 1);

  return {
    startDate: toLocalDateInputValue(startDate),
    endDate: toLocalDateInputValue(endDate),
  };
}

export function formatEvolutionDate(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);
  return evolutionDateFormatter.format(date);
}

export function formatEvolutionDateRange(range: EvolutionDateRange): string {
  return `${formatEvolutionDate(range.startDate)} - ${formatEvolutionDate(range.endDate)}`;
}
