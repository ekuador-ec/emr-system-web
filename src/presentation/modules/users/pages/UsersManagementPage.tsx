import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { useAdminUsers } from "@/presentation/modules/users/hooks/useAdminUsers";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import {
  USER_ROLE_LABELS,
  ACCOUNT_STATUS_LABELS,
  PRESENCE_STATUS_LABELS,
  type AccountStatus,
  type PresenceStatus,
  type UserFilters,
  type UserProfile,
} from "@/domain/modules/users/models/User";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useUserStore } from "@/presentation/modules/users/stores/useUserStore";
import { WcModuleHeader } from "@/presentation/modules/shared/components/ui/webcomponents/Headers/WcModuleHeader";
import { WcTabsFolder } from "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import WcTag from "@/presentation/modules/shared/components/ui/webcomponents/Tags/wcTag";
import WcUserCard from "@/presentation/modules/users/components/Cards/wcUserCard";
import {
  UsersQuickFilterPopover,
  type UsersQuickFilterState,
} from "@/presentation/modules/users/components/UsersQuickFilterPopover";
import {
  WcTables,
  TableAvatarCell,
  TableActionCell,
  type WcTableColumn,
  type WcTableRow,
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import { useProfilesSubscription } from "@/presentation/modules/users/hooks/useProfilesSubscription";
import {
  WcFilterTags,
  type FilterItem,
} from "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcFilterTags";
import WcWarning from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";
import "@/presentation/modules/users/pages/UsersManagementPage.css";

type UserTableRow = WcTableRow & {
  id: string;
  fullName: string;
  email: string;
  role: string;
  accountStatus: AccountStatus;
  phone: string;
  lastSeen: string | null;
  presenceStatus: PresenceStatus;
  isSelf: boolean;
  isDeleted: boolean;
};

type UsersViewMode = "table" | "cards";
const MOBILE_BREAKPOINT_PX = 640;
const USERS_CARDS_PAGE_SIZE = 8;
const USERS_TABLE_PAGE_SIZE = 10;
const USERS_VIEW_MODE_STORAGE_KEY = "users-management:view-mode";

const DEFAULT_USER_FILTERS: UsersQuickFilterState = {
  role: [],
  status: ["active"],
  presence: [],
};

function areArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

function countAppliedFilters(
  filters: UsersQuickFilterState,
  options?: { includeDefaultStatus?: boolean },
): number {
  const includeDefaultStatus = options?.includeDefaultStatus ?? false;
  let count = 0;

  if (filters.role.length > 0) count += 1;
  if (includeDefaultStatus) {
    if (filters.status.length > 0) count += 1;
  } else if (!areArraysEqual(filters.status, DEFAULT_USER_FILTERS.status)) {
    count += 1;
  }
  if (filters.presence.length > 0) count += 1;

  return count;
}

function hasNonDefaultFilters(
  filters: UsersQuickFilterState,
  searchTerm: string,
): boolean {
  return countAppliedFilters(filters) > 0 || searchTerm.length > 0;
}

function getActiveFilterTags(
  filters: UsersQuickFilterState,
  searchTerm: string,
): FilterItem[] {
  const tags: FilterItem[] = [];

  if (filters.status.length > 0) {
    filters.status.forEach((status) => {
      tags.push({
        id: `status-${status}`,
        label: "Estado",
        value: ACCOUNT_STATUS_LABELS[status as AccountStatus] ?? status,
      });
    });
  }

  if (filters.role.length > 0) {
    filters.role.forEach((role) => {
      tags.push({
        id: `role-${role}`,
        label: "Rol",
        value: isUserRole(role) ? USER_ROLE_LABELS[role] : role,
      });
    });
  }

  if (filters.presence.length > 0) {
    filters.presence.forEach((presence) => {
      tags.push({
        id: `presence-${presence}`,
        label: "Conexion",
        value: PRESENCE_STATUS_LABELS[presence] ?? presence,
      });
    });
  }

  if (searchTerm.length > 0) {
    tags.push({
      id: "search",
      label: "Búsqueda",
      value: searchTerm,
    });
  }

  return tags;
}

function buildServerFilters(
  uiFilters: UsersQuickFilterState,
  searchTerm: string,
): UserFilters {
  const normalizedStatuses =
    uiFilters.status.length > 0 ? uiFilters.status : DEFAULT_USER_FILTERS.status;

  return {
    roles:
      uiFilters.role.length > 0
        ? (uiFilters.role as UserFilters["roles"])
        : undefined,
    statuses:
      normalizedStatuses.length > 0
        ? (normalizedStatuses as UserFilters["statuses"])
        : undefined,
    presenceStatuses:
      uiFilters.presence.length > 0 ? uiFilters.presence : undefined,
    searchTerm: searchTerm || null,
    includeDeleted: true,
  };
}

function normalizeFilterState(filters: UsersQuickFilterState): UsersQuickFilterState {
  return {
    ...filters,
    status: filters.status.length > 0 ? filters.status : [...DEFAULT_USER_FILTERS.status],
  };
}

function isUserRole(value: string): value is keyof typeof USER_ROLE_LABELS {
  return value in USER_ROLE_LABELS;
}

function toAccountStatus(value: unknown): AccountStatus {
  if (value === "active" || value === "inactive" || value === "suspended") {
    return value;
  }

  return "inactive";
}

function buildWhatsAppUrl(phone: string): string | null {
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length < 8) {
    return null;
  }

  let normalizedPhone = digitsOnly;

  if (normalizedPhone.startsWith("00")) {
    normalizedPhone = normalizedPhone.slice(2);
  }

  if (normalizedPhone.length === 10 && normalizedPhone.startsWith("0")) {
    normalizedPhone = `593${normalizedPhone.slice(1)}`;
  } else if (normalizedPhone.length === 9 && normalizedPhone.startsWith("9")) {
    normalizedPhone = `593${normalizedPhone}`;
  }

  if (normalizedPhone.length < 8 || normalizedPhone.length > 15) {
    return null;
  }

  return `https://web.whatsapp.com/send?phone=${normalizedPhone}`;
}

function getStatusTagVariant(
  status: AccountStatus,
  isDeleted: boolean,
): "success" | "warning" | "danger" | "info" {
  if (isDeleted) {
    return "danger";
  }

  if (status === "active") {
    return "success";
  }

  if (status === "suspended") {
    return "warning";
  }

  return "info";
}

function getPresenceTagVariant(
  status: PresenceStatus,
): "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "online":
      return "success";
    case "away":
      return "warning";
    case "busy":
      return "danger";
    default:
      return "neutral";
  }
}

function toPresenceStatusOrOffline(value: unknown): PresenceStatus {
  if (value === "online" || value === "away" || value === "busy" || value === "offline") {
    return value;
  }
  return "offline";
}

function isUsersViewMode(value: unknown): value is UsersViewMode {
  return value === "table" || value === "cards";
}

function getUsersViewModeStorageKey(userId: string | null): string {
  return userId
    ? `${USERS_VIEW_MODE_STORAGE_KEY}:${userId}`
    : USERS_VIEW_MODE_STORAGE_KEY;
}

function readUsersViewModeFromStorage(
  storageKey: string,
): UsersViewMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);
    if (!isUsersViewMode(storedValue)) {
      return null;
    }

    return storedValue;
  } catch {
    return null;
  }
}

function writeUsersViewModeToStorage(
  storageKey: string,
  viewMode: UsersViewMode,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, viewMode);
  } catch {
    return;
  }
}

function readViewModeFromRecord(
  record: Record<string, unknown>,
): UsersViewMode | null {
  const directCandidate =
    record.usersViewMode ??
    record.users_view_mode ??
    record.viewMode ??
    record.view_mode;

  if (isUsersViewMode(directCandidate)) {
    return directCandidate;
  }

  const nestedCandidate =
    record.preferences ?? record.settings ?? record.uiPreferences;

  if (!nestedCandidate || typeof nestedCandidate !== "object") {
    return null;
  }

  const nestedRecord = nestedCandidate as Record<string, unknown>;
  const nestedValue =
    nestedRecord.usersViewMode ??
    nestedRecord.users_view_mode ??
    nestedRecord.viewMode ??
    nestedRecord.view_mode;

  return isUsersViewMode(nestedValue) ? nestedValue : null;
}

function getSupabasePreferredViewMode(
  user: UserProfile | null,
): UsersViewMode | null {
  if (!user) {
    return null;
  }

  return readViewModeFromRecord(user as unknown as Record<string, unknown>);
}

function getCardsPaginationItems(
  totalPages: number,
  currentPage: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const isCurrentInMiddle = currentPage > 1 && currentPage < totalPages;

  if (currentPage > 2) {
    items.push("ellipsis");
  }

  if (isCurrentInMiddle) {
    items.push(currentPage);
  }

  if (currentPage < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);

  return items;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}

export function UsersManagementPage() {
  const { user: currentUser } = useAuth();

  const [appliedFilters, setAppliedFilters] =
    useState<UsersQuickFilterState>(DEFAULT_USER_FILTERS);
  const [draftFilters, setDraftFilters] =
    useState<UsersQuickFilterState>(DEFAULT_USER_FILTERS);
  const [searchValue, setSearchValue] = useState("");

  const serverFilters = useMemo(
    () => buildServerFilters(appliedFilters, searchValue),
    [appliedFilters, searchValue],
  );

  const {
    users,
    isLoading,
    isActivated,
    loadUsers,
    toggleUserStatus,
    isTogglingStatus,
    softDeleteUser,
    isSoftDeleting,
    restoreDeletedUser,
    isRestoring,
  } = useAdminUsers(serverFilters);

  const { addToast } = useToastStore();

  const { setInviteModalOpen } = useUserStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);
  const [suspendConfirm, setSuspendConfirm] = useState<{
    userId: string;
    status: AccountStatus;
  } | null>(null);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches
      : false,
  );
  const [viewMode, setViewMode] = useState<UsersViewMode>("table");
  const [hydratedViewModeKey, setHydratedViewModeKey] = useState<string | null>(
    null,
  );
  const [cardsCurrentPage, setCardsCurrentPage] = useState(1);

  const handleConfirmToggleStatus = async () => {
    if (!suspendConfirm) return;
    try {
      await toggleUserStatus(suspendConfirm);
      const label =
        suspendConfirm.status === "suspended" ? "suspendida" : "activada";
      setSuspendConfirm(null);
      addToast({ type: "success", message: `Cuenta ${label} exitosamente` });
    } catch (error: unknown) {
      addToast({
        type: "error",
        message: getErrorMessage(
          error,
          "No se pudo actualizar el estado del usuario",
        ),
      });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await softDeleteUser(userId);
      setDeleteConfirmId(null);
      addToast({ type: "success", message: "Usuario inactivado exitosamente" });
    } catch (error: unknown) {
      addToast({
        type: "error",
        message: getErrorMessage(error, "No se pudo inactivar el usuario"),
      });
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreConfirmId) return;
    try {
      await restoreDeletedUser(restoreConfirmId);
      setRestoreConfirmId(null);
      addToast({ type: "success", message: "Usuario restaurado exitosamente" });
    } catch (error: unknown) {
      addToast({
        type: "error",
        message: getErrorMessage(error, "No se pudo restaurar el usuario"),
      });
    }
  };

  useProfilesSubscription(isActivated);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT_PX}px)`,
    );
    const syncMobileMode = (matches: boolean) => {
      setIsMobileViewport(matches);
    };

    syncMobileMode(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent) => {
      syncMobileMode(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (isMobileViewport && viewMode !== "cards") {
      setViewMode("cards");
    }
  }, [isMobileViewport, viewMode]);

  useEffect(() => {
    setCardsCurrentPage(1);
  }, [searchValue, appliedFilters, viewMode, isMobileViewport]);
  const usersViewModeStorageKey = useMemo(
    () => getUsersViewModeStorageKey(currentUser?.id ?? null),
    [currentUser?.id],
  );

  const supabasePreferredViewMode = useMemo(
    () => getSupabasePreferredViewMode(currentUser),
    [currentUser],
  );

  useEffect(() => {
    const localStoredViewMode = readUsersViewModeFromStorage(
      usersViewModeStorageKey,
    );
    const resolvedViewMode =
      supabasePreferredViewMode ?? localStoredViewMode ?? "table";
    setViewMode(resolvedViewMode);
    setHydratedViewModeKey(usersViewModeStorageKey);
  }, [supabasePreferredViewMode, usersViewModeStorageKey]);

  useEffect(() => {
    if (isMobileViewport) {
      return;
    }

    if (hydratedViewModeKey !== usersViewModeStorageKey) {
      return;
    }

    writeUsersViewModeToStorage(usersViewModeStorageKey, viewMode);
  }, [
    hydratedViewModeKey,
    isMobileViewport,
    usersViewModeStorageKey,
    viewMode,
  ]);

  const filterTags = useMemo(
    () => getActiveFilterTags(appliedFilters, searchValue),
    [appliedFilters, searchValue],
  );

  const filtersAreNonDefault = useMemo(
    () => hasNonDefaultFilters(appliedFilters, searchValue),
    [appliedFilters, searchValue],
  );

  const userTableRows: UserTableRow[] = useMemo(() => {
    const getStatusWeight = (user: UserProfile) => {
      if (user.deletedAt) return 3;
      if (user.accountStatus === "active") return 1;
      if (user.accountStatus === "suspended") return 2;
      return 3;
    };

    return [...users]
      .sort((a, b) => getStatusWeight(a) - getStatusWeight(b))
      .map((user) => ({
        id: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        phone: user.phone ?? "--",
        lastSeen: user.lastSeen,
        presenceStatus: user.presenceStatus,
        isSelf: user.id === currentUser?.id,
        isDeleted: Boolean(user.deletedAt),
        avatarUrl: user.avatarUrl || undefined,
      }));
  }, [users, currentUser?.id]);

  const cardsTotalRows = userTableRows.length;
  const cardsTotalPages = Math.max(
    1,
    Math.ceil(cardsTotalRows / USERS_CARDS_PAGE_SIZE),
  );
  const safeCardsPage = Math.min(cardsCurrentPage, cardsTotalPages);
  const cardsPageStart =
    cardsTotalRows === 0 ? 0 : (safeCardsPage - 1) * USERS_CARDS_PAGE_SIZE + 1;
  const cardsPageEnd =
    cardsTotalRows === 0
      ? 0
      : Math.min(safeCardsPage * USERS_CARDS_PAGE_SIZE, cardsTotalRows);
  const cardsPaginationItems = getCardsPaginationItems(
    cardsTotalPages,
    safeCardsPage,
  );

  useEffect(() => {
    setCardsCurrentPage((previous) => Math.min(previous, cardsTotalPages));
  }, [cardsTotalPages]);

  const paginatedCardRows = useMemo(
    () =>
      userTableRows.slice(
        (safeCardsPage - 1) * USERS_CARDS_PAGE_SIZE,
        safeCardsPage * USERS_CARDS_PAGE_SIZE,
      ),
    [userTableRows, safeCardsPage],
  );

  const userColumns: WcTableColumn[] = [
    {
      key: "accountStatus",
      name: "Estado",
      width: "150px",
      align: "center",
      render: (row) => {
        const isDeleted = row.isDeleted === true;
        const accountStatus = toAccountStatus(row.accountStatus);
        const label = isDeleted
          ? "Inactivo"
          : ACCOUNT_STATUS_LABELS[accountStatus];

        return (
          <WcTag
            variant={getStatusTagVariant(accountStatus, isDeleted)}
            size="sm"
          >
            {label}
          </WcTag>
        );
      },
    },
    {
      key: "fullName",
      name: "Nombre",
      render: (row) => (
        <TableAvatarCell
          avatarUrl={row.avatarUrl as string | undefined}
          title={row.fullName as string}
        />
      ),
    },
    {
      key: "email",
      name: "Correo",
      align: "center",
    },
    {
      key: "role",
      name: "Rol",
      align: "center",
      render: (row) => {
        const roleValue = typeof row.role === "string" ? row.role : "";
        if (!isUserRole(roleValue)) return "--";
        return USER_ROLE_LABELS[roleValue];
      },
    },
    {
      key: "presenceStatus",
      name: "Conexion",
      align: "center",
      width: "130px",
      render: (row) => {
        const presence = toPresenceStatusOrOffline(row.presenceStatus);
        return (
          <WcTag variant={getPresenceTagVariant(presence)} size="sm">
            {PRESENCE_STATUS_LABELS[presence]}
          </WcTag>
        );
      },
    },
    {
      key: "phone",
      name: "Telefono",
      align: "center",
      render: (row) => {
        const phoneValue =
          typeof row.phone === "string" && row.phone.trim().length > 0
            ? row.phone
            : "--";
        const whatsappUrl = buildWhatsAppUrl(phoneValue);

        if (!whatsappUrl || phoneValue === "--") {
          return phoneValue;
        }

        return (
          <span className="users-phone-cell">
            <span>{phoneValue}</span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="users-phone-whatsapp-link"
              title={`Abrir chat de WhatsApp para ${phoneValue}`}
              aria-label={`Abrir chat de WhatsApp para ${phoneValue}`}
            >
              <Icon name="icon-clip" size={10} />
            </a>
          </span>
        );
      },
    },
    {
      key: "lastSeen",
      name: "Ultima conexion",
      align: "center",
      render: (row) => {
        const value = typeof row.lastSeen === "string" ? row.lastSeen : null;
        return formatDateTime(value);
      },
    },
    {
      key: "actions",
      name: "Acciones",
      align: "center",
      width: "132px",
      render: (row) => {
        const userId = typeof row.id === "string" ? row.id : "";
        const isSelfUser = row.isSelf === true;
        const isDeleted = row.isDeleted === true;
        const accountStatus = toAccountStatus(row.accountStatus);
        const nextStatus: AccountStatus =
          accountStatus === "active" ? "suspended" : "active";
        if (!userId) return null;
        return (
          <TableActionCell className="users-table-action-cell">
            {!isSelfUser && isDeleted ? (
              <WcButtonIcon
                variant="primary"
                shape="square"
                size="sm"
                className="users-table-action-icon"
                icon="icon-user-plus-solid"
                title="Restaurar usuario"
                aria-label="Restaurar usuario"
                disabled={isRestoring}
                onClick={() => setRestoreConfirmId(userId)}
              />
            ) : !isSelfUser && !isDeleted ? (
              <>
                <WcButtonIcon
                  variant="primary"
                  shape="square"
                  size="sm"
                  className="users-table-action-icon"
                  icon={
                    accountStatus === "active"
                      ? "icon-lock"
                      : "icon-activate-solid"
                  }
                  title={
                    accountStatus === "active"
                      ? "Suspender usuario"
                      : "Activar usuario"
                  }
                  aria-label={
                    accountStatus === "active"
                      ? "Suspender usuario"
                      : "Activar usuario"
                  }
                  disabled={isTogglingStatus}
                  onClick={() =>
                    setSuspendConfirm({ userId, status: nextStatus })
                  }
                />
                <WcButtonIcon
                  variant="danger"
                  shape="square"
                  size="sm"
                  className="users-table-action-icon"
                  icon="icon-trash"
                  title="Inactivar usuario"
                  aria-label="Inactivar usuario"
                  onClick={() => setDeleteConfirmId(userId)}
                />
              </>
            ) : null}
          </TableActionCell>
        );
      },
    },
  ];

  const applyDraftFilters = () => {
    const normalizedFilters = normalizeFilterState(draftFilters);
    setAppliedFilters(normalizedFilters);
    setDraftFilters(normalizedFilters);
    setIsFilterPopoverOpen(false);
    if (!isActivated) {
      loadUsers();
    }
  };

  const clearFilters = () => {
    setDraftFilters(DEFAULT_USER_FILTERS);
    setAppliedFilters(DEFAULT_USER_FILTERS);
    setIsFilterPopoverOpen(false);
  };

  const clearAllFiltersAndSearch = () => {
    const hasAppliedSelection = hasNonDefaultFilters(
      appliedFilters,
      searchValue,
    );
    const hasDraftSelection = hasNonDefaultFilters(
      draftFilters,
      searchInputValue.trim(),
    );

    if (!hasAppliedSelection && !hasDraftSelection) {
      addToast({
        type: "warning",
        message: "No hay filtros seleccionados para limpiar.",
        placement: "top-right",
      });
      return;
    }

    clearFilters();
    setSearchInputValue("");
    setSearchValue("");
  };

  const removeFilterTag = (filterId: string) => {
    if (filterId === "search") {
      setSearchInputValue("");
      setSearchValue("");
      return;
    }

    if (filterId.startsWith("status-")) {
      const status = filterId.replace("status-", "");
      const next = normalizeFilterState({
        ...appliedFilters,
        status: appliedFilters.status.filter((s) => s !== status),
      });
      setAppliedFilters(next);
      setDraftFilters(next);
      return;
    }

    if (filterId.startsWith("role-")) {
      const role = filterId.replace("role-", "");
      const next = {
        ...appliedFilters,
        role: appliedFilters.role.filter((r) => r !== role),
      };
      setAppliedFilters(next);
      setDraftFilters(next);
      return;
    }

    if (filterId.startsWith("presence-")) {
      const value = filterId.replace("presence-", "") as PresenceStatus;
      const next = {
        ...appliedFilters,
        presence: appliedFilters.presence.filter((p) => p !== value),
      };
      setAppliedFilters(next);
      setDraftFilters(next);
      return;
    }
  };

  const applySearch = () => {
    if (!isActivated) {
      loadUsers();
    }
    setSearchValue(searchInputValue.trim());
  };

  const appliedFiltersCount = useMemo(
    () => countAppliedFilters(appliedFilters, { includeDefaultStatus: true }),
    [appliedFilters],
  );

  const renderFiltersControl = () => (
    <UsersQuickFilterPopover
      isOpen={isFilterPopoverOpen}
      activeFiltersCount={appliedFiltersCount}
      filters={draftFilters}
      onToggle={() => setIsFilterPopoverOpen((previous) => !previous)}
      onChange={setDraftFilters}
      onClear={clearFilters}
      onApply={applyDraftFilters}
    />
  );

  const renderSearchInput = () => (
    <WcSearchInput
      value={searchInputValue}
      onValueChange={setSearchInputValue}
      placeholder="Buscar por nombre o correo"
      wrapperClassName="users-search-input"
      showSubmitButton={true}
      submitButtonLabel="Buscar"
      showSubmitIcon={true}
      submitButtonIconOnly={isMobileViewport}
      onSubmit={applySearch}
      aria-label="Buscar por nombre o correo"
    />
  );

  const renderSearchWithFilters = () => (
    <div className="users-search-filters-group">
      {renderFiltersControl()}
      {filtersAreNonDefault ? (
        <WcButton
          variant="secondary"
          className="users-search-filters-group__clear-btn"
          onClick={clearAllFiltersAndSearch}
        >
          <Icon name="icon-trash-solid" size={14} />
          Limpiar
        </WcButton>
      ) : null}
      {renderSearchInput()}
    </div>
  );

  const renderDesktopTabHeaderExtra = () => {
    const viewModeButtons =
      !isMobileViewport ? (
        <div
          className="users-view-toggle"
          role="group"
          aria-label="Modo de visualizacion"
          style={{ flexShrink: 0 }}
        >
          <WcButtonIcon
            variant="ghost"
            shape="square"
            size="sm"
            aria-pressed={viewMode === "table"}
            className={`users-view-toggle__btn users-view-toggle__btn--icon-only${viewMode === "table" ? " is-active" : ""}`}
            onClick={() => setViewMode("table")}
            title="Vista en tabla"
            aria-label="Vista en tabla"
            icon="icon-table"
          />
          <WcButtonIcon
            variant="ghost"
            shape="square"
            size="sm"
            aria-pressed={viewMode === "cards"}
            className={`users-view-toggle__btn users-view-toggle__btn--icon-only${viewMode === "cards" ? " is-active" : ""}`}
            onClick={() => setViewMode("cards")}
            title="Vista en tarjetas"
            aria-label="Vista en tarjetas"
            icon="icon-card"
          />
        </div>
      ) : null;

    return (
      <div className="users-tab-header-toolbar">
        <div className="users-tab-header-toolbar__right">
          {renderSearchWithFilters()}
          {viewModeButtons}
        </div>
      </div>
    );
  };

  const renderViewModeControls = () => {
    const shouldShowMobileToggle = isMobileViewport;
    const shouldShowFilterTags = isActivated && filterTags.length > 0;

    if (!shouldShowMobileToggle && !shouldShowFilterTags) {
      return null;
    }

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
        }}
      >
        {shouldShowFilterTags && (
          <div style={{ flex: 1 }}>
            <WcFilterTags filters={filterTags} onRemove={removeFilterTag} />
          </div>
        )}
        {shouldShowMobileToggle && (
          <div
            className="users-view-toggle"
            role="group"
            aria-label="Modo de visualizacion"
            style={{ flexShrink: 0 }}
          >
            <WcButtonIcon
              variant="ghost"
              shape="square"
              size="sm"
              aria-pressed={viewMode === "table"}
              className={`users-view-toggle__btn users-view-toggle__btn--icon-only${viewMode === "table" ? " is-active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Vista en tabla"
              aria-label="Vista en tabla"
              icon="icon-table"
            />
            <WcButtonIcon
              variant="ghost"
              shape="square"
              size="sm"
              aria-pressed={viewMode === "cards"}
              className={`users-view-toggle__btn users-view-toggle__btn--icon-only${viewMode === "cards" ? " is-active" : ""}`}
              onClick={() => setViewMode("cards")}
              title="Vista en tarjetas"
              aria-label="Vista en tarjetas"
              icon="icon-card"
            />
          </div>
        )}
      </div>
    );
  };

  const selectedDeleteUser =
    deleteConfirmId !== null
      ? (users.find((user) => user.id === deleteConfirmId) ?? null)
      : null;

  const selectedRestoreUser =
    restoreConfirmId !== null
      ? (users.find((user) => user.id === restoreConfirmId) ?? null)
      : null;

  const selectedSuspendUser =
    suspendConfirm !== null
      ? (users.find((user) => user.id === suspendConfirm.userId) ?? null)
      : null;

  return (
    <div
      className="users-management-page"
      style={{
        padding: isMobileViewport ? "var(--space-3)" : "var(--space-6)",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <WcModuleHeader
        moduleName="Administración"
        moduleIcon="icon-users-solid"
        title="Gestión de Usuarios"
        description="Administre de forma segura el acceso y los perfiles de su organización."
      >
        <WcButton
          variant="primary"
          className="users-page-header__add-btn"
          onClick={() => setInviteModalOpen(true)}
        >
          <Icon name="icon-user-plus" size={14} />
          Agregar usuario
        </WcButton>
      </WcModuleHeader>

      {isMobileViewport ? (
        <div className="users-mobile-top-controls">
          <div className="users-mobile-top-controls__search">
            {renderSearchWithFilters()}
          </div>
        </div>
      ) : null}

      <WcTabsFolder
        headerExtra={
          !isMobileViewport ? renderDesktopTabHeaderExtra() : undefined
        }
        tabs={[
          {
            name: "Usuarios",
            icon: <Icon name="icon-users" size={16} />,
            content: (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                }}
              >
                {renderViewModeControls()}

                {!isActivated ? (
                  <div className="users-load-cta">
                    <Icon
                      name="icon-user-config"
                      size={32}
                      className="users-load-cta__icon"
                    />
                    <p className="users-load-cta__title">
                      Cargar usuarios
                    </p>
                    <p className="users-load-cta__description">
                      Presione el boton para consultar los usuarios activos del
                      sistema y comenzar la gestion.
                    </p>
                    <WcButton
                      variant="primary"
                      className="users-load-cta__button"
                      onClick={loadUsers}
                      disabled={isLoading}
                    >
                      <Icon name="icon-plus-solid" size={16} />
                      Cargar usuarios
                    </WcButton>
                  </div>
                ) : isLoading ? (
                  <div className="card users-cards-empty">
                    Cargando usuarios...
                  </div>
                ) : userTableRows.length === 0 ? (
                  <div
                    className={`users-empty-state${filtersAreNonDefault ? " is-filtered" : ""}`}
                  >
                    <Icon
                      name={filtersAreNonDefault ? "icon-cloud-close-solid" : "icon-users-solid"}
                      size={40}
                      className="users-empty-state__icon"
                    />
                    {filtersAreNonDefault ? (
                      <>
                        <p className="users-empty-state__title">
                          Sin resultados
                        </p>
                        <p className="users-empty-state__description">
                          No encontramos usuarios con los filtros actuales.
                          Ajuste los criterios de busqueda o limpie los filtros
                          para volver a intentarlo.
                        </p>
                        <div className="users-empty-state__actions">
                          <WcButton
                            variant="secondary"
                            onClick={clearAllFiltersAndSearch}
                          >
                            <Icon name="icon-trash-solid" size={14} />
                            Limpiar
                          </WcButton>
                          <WcButton
                            variant="primary"
                            onClick={() => setIsFilterPopoverOpen(true)}
                          >
                            <Icon name="icon-filters" size={14} />
                            Filtros
                          </WcButton>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="users-empty-state__title">
                          No hay usuarios activos
                        </p>
                        <p className="users-empty-state__description">
                          No se encontraron usuarios activos en el sistema.
                          Puede invitar nuevos usuarios o ajustar los filtros
                          para ver otros estados.
                        </p>
                        <div className="users-empty-state__actions">
                          <WcButton
                            variant="secondary"
                            onClick={() => setIsFilterPopoverOpen(true)}
                          >
                            <Icon name="icon-users-solid" size={14} />
                            Estados
                          </WcButton>
                          <WcButton
                            variant="primary"
                            onClick={() => setInviteModalOpen(true)}
                          >
                            <Icon name="icon-user-plus-solid" size={14} />
                            Invitar
                          </WcButton>
                        </div>
                      </>
                    )}
                  </div>
                ) : !isMobileViewport && viewMode === "table" ? (
                  <div>
                    <WcTables
                      columns={userColumns}
                      rows={userTableRows}
                      emptyMessage="No hay usuarios registrados"
                      pageSize={USERS_TABLE_PAGE_SIZE}
                    />
                  </div>
                ) : (
                  <div className="users-cards-view">
                    <div className="users-cards-grid">
                      {paginatedCardRows.map((row) => {
                        const roleValue =
                          typeof row.role === "string" ? row.role : "";
                        const roleLabel = isUserRole(roleValue)
                          ? USER_ROLE_LABELS[roleValue]
                          : "--";
                        const statusLabel = row.isDeleted
                          ? "Inactivo"
                          : ACCOUNT_STATUS_LABELS[
                              toAccountStatus(row.accountStatus)
                            ];
                        const statusTone = row.isDeleted
                          ? "deleted"
                          : toAccountStatus(row.accountStatus);
                        const userId = typeof row.id === "string" ? row.id : "";
                        const accountStatus = toAccountStatus(
                          row.accountStatus,
                        );
                        const nextStatus: AccountStatus =
                          accountStatus === "active" ? "suspended" : "active";

                        return (
                          <WcUserCard
                            key={row.id}
                            avatarUrl={
                              typeof row.avatarUrl === "string"
                                ? row.avatarUrl
                                : undefined
                            }
                            fullName={
                              typeof row.fullName === "string"
                                ? row.fullName
                                : "--"
                            }
                            email={
                              typeof row.email === "string" ? row.email : "--"
                            }
                            roleLabel={roleLabel}
                            statusLabel={statusLabel}
                            statusTone={statusTone}
                            presenceStatus={toPresenceStatusOrOffline(row.presenceStatus)}
                            phone={
                              typeof row.phone === "string" ? row.phone : "--"
                            }
                            whatsappUrl={buildWhatsAppUrl(
                              typeof row.phone === "string" ? row.phone : "--",
                            )}
                            lastSeen={formatDateTime(
                              typeof row.lastSeen === "string"
                                ? row.lastSeen
                                : null,
                            )}
                            canManage={!row.isSelf && Boolean(userId)}
                            isDeleted={row.isDeleted === true}
                            isTogglingStatus={isTogglingStatus}
                            isRestoring={isRestoring}
                            statusActionIcon={
                              accountStatus === "active"
                                ? "icon-lock"
                                : "icon-activate-solid"
                            }
                            statusActionLabel={
                              accountStatus === "active"
                                ? "Suspender usuario"
                                : "Activar usuario"
                            }
                            onToggleStatus={() =>
                              setSuspendConfirm({ userId, status: nextStatus })
                            }
                            onDelete={() => setDeleteConfirmId(userId)}
                            onRestore={() => setRestoreConfirmId(userId)}
                          />
                        );
                      })}
                    </div>

                    {cardsTotalRows > 0 ? (
                      <div className="users-cards-pagination">
                        <p className="users-cards-pagination__summary">
                          {`Mostrando ${cardsPageStart}-${cardsPageEnd} de ${cardsTotalRows} usuarios`}
                        </p>

                        <div className="users-cards-pagination__controls">
                          <WcButton
                            variant="primary"
                            className="users-cards-pagination-btn"
                            onClick={() =>
                              setCardsCurrentPage((previous) =>
                                Math.max(1, previous - 1),
                              )
                            }
                            disabled={safeCardsPage === 1}
                            aria-label="Pagina anterior"
                          >
                            {"<"}
                          </WcButton>

                          {cardsPaginationItems.map((item, index) =>
                            item === "ellipsis" ? (
                              <span
                                key={`cards-ellipsis-${index}`}
                                className="users-cards-pagination__ellipsis"
                              >
                                ...
                              </span>
                            ) : (
                              <WcButton
                                key={`cards-page-${item}`}
                                variant={
                                  safeCardsPage === item
                                    ? "primary"
                                    : "secondary"
                                }
                                className={`users-cards-pagination-btn${safeCardsPage === item ? " users-cards-pagination-btn--active" : ""}`}
                                onClick={() => setCardsCurrentPage(item)}
                              >
                                {item}
                              </WcButton>
                            ),
                          )}

                          <WcButton
                            variant="primary"
                            className="users-cards-pagination-btn"
                            onClick={() =>
                              setCardsCurrentPage((previous) =>
                                Math.min(cardsTotalPages, previous + 1),
                              )
                            }
                            disabled={safeCardsPage === cardsTotalPages}
                            aria-label="Pagina siguiente"
                          >
                            {">"}
                          </WcButton>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      {deleteConfirmId && selectedDeleteUser && (
        <WcWarning
          isOpen
          type="destructive"
          icon={<Icon name="icon-trash-solid" size={24} />}
          title="Confirmar inactivacion"
          description="El usuario perdera acceso al sistema. Sus datos se conservaran para trazabilidad."
          message={
            <>
              ¿Inactivar a{" "}
              <strong style={{ color: "var(--color-text)" }}>
                {selectedDeleteUser.firstName} {selectedDeleteUser.lastName}
              </strong>
              ?
            </>
          }
          confirmText="Si, Inactivar"
          loadingText="Inactivando..."
          isConfirmLoading={isSoftDeleting}
          onConfirm={() => handleDelete(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {restoreConfirmId && selectedRestoreUser && (
        <WcWarning
          isOpen
          type="info"
          icon={<Icon name="icon-user-plus-solid" size={24} />}
          title="Confirmar restauracion"
          description="El usuario recuperara acceso al sistema con los permisos de su rol."
          message={
            <>
              ¿Restaurar a{" "}
              <strong style={{ color: "var(--color-text)" }}>
                {selectedRestoreUser.firstName} {selectedRestoreUser.lastName}
              </strong>
              ?
            </>
          }
          confirmText="Si, Restaurar"
          loadingText="Restaurando..."
          isConfirmLoading={isRestoring}
          onConfirm={handleConfirmRestore}
          onCancel={() => setRestoreConfirmId(null)}
        />
      )}

      {suspendConfirm && selectedSuspendUser && (
        <WcWarning
          isOpen
          type={suspendConfirm.status === "suspended" ? "warning" : "info"}
          icon={
            <Icon
              name={
                suspendConfirm.status === "suspended"
                  ? "icon-lock-solid"
                  : "icon-activate-solid"
              }
              size={24}
            />
          }
          title={
            suspendConfirm.status === "suspended"
              ? "Confirmar suspension"
              : "Confirmar activacion"
          }
          description={
            suspendConfirm.status === "suspended"
              ? "El usuario no podra iniciar sesion mientras este suspendido. Puedes reactivarlo en cualquier momento."
              : "Recuperara acceso al sistema con los permisos de su rol."
          }
          message={
            suspendConfirm.status === "suspended" ? (
              <>
                ¿Suspender a{" "}
                <strong style={{ color: "var(--color-text)" }}>
                  {selectedSuspendUser.firstName} {selectedSuspendUser.lastName}
                </strong>
                ?
              </>
            ) : (
              <>
                ¿Activar a{" "}
                <strong style={{ color: "var(--color-text)" }}>
                  {selectedSuspendUser.firstName} {selectedSuspendUser.lastName}
                </strong>
                ?
              </>
            )
          }
          confirmText={
            suspendConfirm.status === "suspended"
              ? "Si, Suspender"
              : "Si, Activar"
          }
          loadingText={
            suspendConfirm.status === "suspended"
              ? "Suspendiendo..."
              : "Activando..."
          }
          isConfirmLoading={isTogglingStatus}
          onConfirm={handleConfirmToggleStatus}
          onCancel={() => setSuspendConfirm(null)}
        />
      )}
    </div>
  );
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "--";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}
