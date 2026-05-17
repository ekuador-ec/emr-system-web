import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { downloadCsv, type CsvColumn } from "../../utils/csvExport";

interface ExportCsvButtonProps<T> {
  rows: T[];
  columns: Array<CsvColumn<T>>;
  filenameBase: string;
  disabled?: boolean;
  label?: string;
  variant?: "primary" | "secondary" | "danger" | "terciary" | "success";
}

export function ExportCsvButton<T>({
  rows,
  columns,
  filenameBase,
  disabled,
  label = "Exportar CSV",
  variant = "terciary",
}: ExportCsvButtonProps<T>) {
  const isDisabled = disabled || !rows || rows.length === 0;

  return (
    <WcButton
      variant={variant}
      onClick={() => downloadCsv(rows, columns, filenameBase)}
      disabled={isDisabled}
      title={isDisabled ? "No hay datos para exportar" : "Descargar archivo CSV"}
    >
      <Icon name="icon-save" size={14} />
      {label}
    </WcButton>
  );
}
