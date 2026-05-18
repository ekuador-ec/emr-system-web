import {
  PRESENCE_STATUS_LABELS,
  USER_ROLE_LABELS,
  type PresenceStatus,
} from "@/domain/modules/users/models/User";
import {
  WcFilterPopover,
} from "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcFilterPopover";
import type {
  WcFilterField,
} from "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcFilterPopover";

export type UsersQuickFilterState = {
  role: string[];
  status: string[];
  presence: PresenceStatus[];
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

export const USERS_QUICK_FILTER_FIELDS: Array<WcFilterField<UsersQuickFilterState>> = [
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
    key: "presence",
    id: "users-filter-presence",
    label: "Estado de conexion",
    multiSelect: true,
    options: (["online", "away", "busy", "offline"] as PresenceStatus[]).map(
      (value) => ({
        value,
        label: PRESENCE_STATUS_LABELS[value],
      }),
    ),
  },
];

export function UsersQuickFilterPopover(props: UsersQuickFilterPopoverProps) {
  return (
    <WcFilterPopover
      isOpen={props.isOpen}
      activeFiltersCount={props.activeFiltersCount}
      values={props.filters}
      fields={USERS_QUICK_FILTER_FIELDS}
      onToggle={props.onToggle}
      onChange={props.onChange}
      onClear={props.onClear}
      onApply={props.onApply}
      triggerLabel="Filtros"
    />
  );
}
