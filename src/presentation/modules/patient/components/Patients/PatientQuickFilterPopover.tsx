import {
  WcFilterPopover,
  type WcFilterField,
} from "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcFilterPopover";
import type { GenderEnum } from "@/domain/modules/catalog/models/Catalog";

export type PatientQuickFilterState = {
  gender: string[];
  isActive: string[];
};

type PatientQuickFilterPopoverProps = {
  isOpen: boolean;
  activeFiltersCount: number;
  filters: PatientQuickFilterState;
  onToggle: () => void;
  onChange: (next: PatientQuickFilterState) => void;
  onClear: () => void;
  onApply: () => void;
};

export function PatientQuickFilterPopover(props: PatientQuickFilterPopoverProps) {
  const fields: Array<WcFilterField<PatientQuickFilterState>> = [
    {
      key: "gender",
      id: "patient-filter-gender",
      label: "Género",
      options: [
        { value: "all", label: "Todos" },
        { value: "MASCULINO", label: "Masculino" },
        { value: "FEMENINO", label: "Femenino" },
      ],
    },
    {
      key: "isActive",
      id: "patient-filter-status",
      label: "Estado",
      options: [
        { value: "all", label: "Todos" },
        { value: "active", label: "Solo Activos" },
        { value: "inactive", label: "Solo Inactivos (Archivados)" },
      ],
    },
  ];

  return (
    <WcFilterPopover
      isOpen={props.isOpen}
      activeFiltersCount={props.activeFiltersCount}
      values={props.filters}
      fields={fields}
      onToggle={props.onToggle}
      onChange={props.onChange}
      onClear={props.onClear}
      onApply={props.onApply}
      triggerLabel="Filtros"
      triggerIcon="icon-filters"
      clearLabel="Limpiar"
      applyLabel="Aplicar Filtros"
      align="right"
    />
  );
}
