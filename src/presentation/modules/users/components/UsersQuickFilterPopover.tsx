import { USER_ROLE_LABELS } from "@/domain/modules/users/models/User";
import {
  WcFilterPopover,
} from "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcFilterPopover";
import type {
  WcFilterField,
} from "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcFilterPopover";

export type OnlineFilter = "all" | "online" | "offline";

export type UsersQuickFilterState = {
  role: string[];
  status: string[];
  online: OnlineFilter;
  includeDeleted: string;
};

type UsersQuickFilterPopoverProps = {
  isOpen: boolean;
  activeFiltersCount: number;
  filters: UsersQuickFilterState;
  onToggle: () => void;
  onChange: (next: UsersQuickFilterState) => void;
  onClear: () => void;
  onApply: () => void;
};

export function UsersQuickFilterPopover(props: UsersQuickFilterPopoverProps) {
  const fields: Array<WcFilterField<UsersQuickFilterState>> = [
    {
      key: "role",
      id: "users-filter-role",
      label: "Rol",
      multiSelect: true,
      options: Object.entries(USER_ROLE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: "status",
      id: "users-filter-status",
      label: "Estado de cuenta",
      multiSelect: true,
      options: [
        { value: "active", label: "Activo" },
        { value: "inactive", label: "Inactivo" },
        { value: "suspended", label: "Suspendido" },
      ],
    },
    {
      key: "online",
      id: "users-filter-online",
      label: "Conexion",
      options: [
        { value: "all", label: "Todos" },
        { value: "online", label: "En linea" },
        { value: "offline", label: "Fuera de linea" },
      ],
    },
    {
      key: "includeDeleted",
      id: "users-filter-deleted",
      label: "Usuarios eliminados",
      options: [
        { value: "no", label: "Ocultar" },
        { value: "yes", label: "Incluir (auditoria)" },
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
    />
  );
}
