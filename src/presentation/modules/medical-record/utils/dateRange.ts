export interface MedicalRecordDateRange {
  startDate: string;
  endDate: string;
}

const medicalRecordDateFormatter = new Intl.DateTimeFormat("es-EC", {
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

export function getRecentMedicalRecordDateRange(): MedicalRecordDateRange {
  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(endDate.getDate() - 1);

  return {
    startDate: toLocalDateInputValue(startDate),
    endDate: toLocalDateInputValue(endDate),
  };
}

export function formatMedicalRecordDate(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);
  return medicalRecordDateFormatter.format(date);
}

export function formatMedicalRecordDateRange(range: MedicalRecordDateRange): string {
  return `${formatMedicalRecordDate(range.startDate)} - ${formatMedicalRecordDate(range.endDate)}`;
}
