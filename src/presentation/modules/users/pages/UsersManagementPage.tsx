import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { useAdminUsers } from "@/presentation/modules/users/hooks/useAdminUsers";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import type {
  AccountStatus,
  UserFilters,
  UserProfile,
} from "@/domain/modules/users/models/User";
import {
  USER_ROLE_LABELS,
  ACCOUNT_STATUS_LABELS,
} from "@/domain/modules/users/models/User";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useUserStore } from "@/presentation/modules/users/stores/useUserStore";
import { WcTabsFolder } from "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import WcUserCard from "@/presentation/modules/users/components/Cards/wcUserCard";
import {
  UsersQuickFilterPopover,
} from "@/presentation/modules/users/components/UsersQuickFilterPopover";
import type {
  UsersQuickFilterState,
} from "@/presentation/modules/users/components/UsersQuickFilterPopover";
import {
  WcTables,
  TableAvatarCell,
  TableActionCell,
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import type {
  WcTableColumn,
  WcTableRow,
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import { useProfilesSubscription } from "@/presentation/modules/users/hooks/useProfilesSubscription";
import "@/presentation/modules/users/pages/UsersManagementPage.css";

type UserTableRow = WcTableRow & {
  id: string;
  fullName: string;
  email: string;
  role: string;
  accountStatus: AccountStatus;
  phone: string;
  lastSeen: string | null;
  isSelf: boolean;
  isDeleted: boolean;
};

type UsersViewMode = "table" | "cards";
type FilterPanelPlacement = "header" | "panel";
const MOBILE_BREAKPOINT_PX = 640;
const USERS_CARDS_PAGE_SIZE = 8;
const USERS_VIEW_MODE_STORAGE_KEY = "users-management:view-mode";

const DEFAULT_USER_FILTERS: UsersQuickFilterState = {
  role: [],
  status: ["active"],
  online: "all",
  includeDeleted: "no",
};

function areArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

function countAppliedFilters(filters: UsersQuickFilterState): number {
  let count = 0;

  if (filters.role.length > 0) count += 1;
  if (!areArraysEqual(filters.status, DEFAULT_USER_FILTERS.status)) count += 1;
  if (filters.online !== DEFAULT_USER_FILTERS.online) count += 1;
  if (filters.includeDeleted !== DEFAULT_USER_FILTERS.includeDeleted) count += 1;

  return count;
}

function hasNonDefaultFilters(
  filters: UsersQuickFilterState,
  searchTerm: string,
): boolean {
  return countAppliedFilters(filters) > 0 || searchTerm.length > 0;
}

const ONLINE_LABELS: Record<string, string> = {
  online: "En linea",
  offline: "Fuera de linea",
};

function getActiveFilterTags(
  filters: UsersQuickFilterState,
  searchTerm: string,
): Array<{ key: string; label: string }> {
  const tags: Array<{ key: string; label: string }> = [];

  if (!areArraysEqual(filters.status, DEFAULT_USER_FILTERS.status)) {
    const labels = filters.status.map(
      (s) => ACCOUNT_STATUS_LABELS[s as AccountStatus] ?? s,
    );
    tags.push({
      key: "status",
      label: `Estado: ${labels.length > 0 ? labels.join(", ") : "Todos"}`,
    });
  }

  if (filters.role.length > 0) {
    const labels = filters.role.map(
      (r) => (isUserRole(r) ? USER_ROLE_LABELS[r] : r),
    );
    tags.push({ key: "role", label: `Rol: ${labels.join(", ")}` });
  }

  if (filters.online !== "all") {
    tags.push({
      key: "online",
      label: ONLINE_LABELS[filters.online] ?? filters.online,
    });
  }

  if (filters.includeDeleted === "yes") {
    tags.push({ key: "includeDeleted", label: "Incluye eliminados" });
  }

  if (searchTerm.length > 0) {
    tags.push({ key: "search", label: `Busqueda: "${searchTerm}"` });
  }

  return tags;
}

function buildServerFilters(
  uiFilters: UsersQuickFilterState,
  searchTerm: string,
): UserFilters {
  return {
    roles: uiFilters.role.length > 0 ? uiFilters.role as UserFilters["roles"] : undefined,
    statuses: uiFilters.status.length > 0 ? uiFilters.status as UserFilters["statuses"] : undefined,
    online: uiFilters.online === "all" ? null : (uiFilters.online as "online" | "offline"),
    searchTerm: searchTerm || null,
    includeDeleted: uiFilters.includeDeleted === "yes",
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

function isUsersViewMode(value: unknown): value is UsersViewMode {
  return value === "table" || value === "cards";
}

function getUsersViewModeStorageKey(userId: string | null): string {
  return userId
    ? `${USERS_VIEW_MODE_STORAGE_KEY}:${userId}`
    : USERS_VIEW_MODE_STORAGE_KEY;
}

function readUsersViewModeFromStorage(storageKey: string): UsersViewMode | null {
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

function writeUsersViewModeToStorage(storageKey: string, viewMode: UsersViewMode): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, viewMode);
  } catch {
    return;
  }
}

function readViewModeFromRecord(record: Record<string, unknown>): UsersViewMode | null {
  const directCandidate =
    record.usersViewMode ??
    record.users_view_mode ??
    record.viewMode ??
    record.view_mode;

  if (isUsersViewMode(directCandidate)) {
    return directCandidate;
  }

  const nestedCandidate = record.preferences ?? record.settings ?? record.uiPreferences;

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

function getSupabasePreferredViewMode(user: UserProfile | null): UsersViewMode | null {
  if (!user) {
    return null;
  }

  return readViewModeFromRecord(user as unknown as Record<string, unknown>);
}

function getCardsPaginationItems(totalPages: number, currentPage: number): Array<number | "ellipsis"> {
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
  const [openFilterPanel, setOpenFilterPanel] = useState<FilterPanelPlacement | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches
      : false,
  );
  const [viewMode, setViewMode] = useState<UsersViewMode>("table");
  const [hydratedViewModeKey, setHydratedViewModeKey] = useState<string | null>(null);
  const [cardsCurrentPage, setCardsCurrentPage] = useState(1);

  const handleConfirmToggleStatus = async () => {
    if (!suspendConfirm) return;
    await toggleUserStatus(suspendConfirm);
    const label = suspendConfirm.status === "suspended" ? "suspendida" : "activada";
    setSuspendConfirm(null);
    addToast({ type: "success", message: `Cuenta ${label} exitosamente` });
  };

  const handleDelete = async (userId: string) => {
    await softDeleteUser(userId);
    setDeleteConfirmId(null);
    addToast({ type: "success", message: "Usuario eliminado exitosamente" });
  };

  const handleConfirmRestore = async () => {
    if (!restoreConfirmId) return;
    await restoreDeletedUser(restoreConfirmId);
    setRestoreConfirmId(null);
    addToast({ type: "success", message: "Usuario restaurado exitosamente" });
  };

  useProfilesSubscription(isActivated);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
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
    const localStoredViewMode = readUsersViewModeFromStorage(usersViewModeStorageKey);
    const resolvedViewMode = supabasePreferredViewMode ?? localStoredViewMode ?? "table";
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
  }, [hydratedViewModeKey, isMobileViewport, usersViewModeStorageKey, viewMode]);

  const appliedFiltersCount = useMemo(
    () => countAppliedFilters(appliedFilters),
    [appliedFilters],
  );

  const filterTags = useMemo(
    () => getActiveFilterTags(appliedFilters, searchValue),
    [appliedFilters, searchValue],
  );

  const filtersAreNonDefault = useMemo(
    () => hasNonDefaultFilters(appliedFilters, searchValue),
    [appliedFilters, searchValue],
  );

  const userTableRows: UserTableRow[] = users.map((user) => ({
    id: user.id,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
    phone: user.phone ?? "--",
    lastSeen: user.lastSeen,
    isSelf: user.id === currentUser?.id,
    isDeleted: Boolean(user.deletedAt),
    avatarUrl: user.avatarUrl || undefined,
  }));

  const cardsTotalRows = userTableRows.length;
  const cardsTotalPages = Math.max(1, Math.ceil(cardsTotalRows / USERS_CARDS_PAGE_SIZE));
  const safeCardsPage = Math.min(cardsCurrentPage, cardsTotalPages);
  const cardsPageStart = cardsTotalRows === 0 ? 0 : (safeCardsPage - 1) * USERS_CARDS_PAGE_SIZE + 1;
  const cardsPageEnd = cardsTotalRows === 0 ? 0 : Math.min(safeCardsPage * USERS_CARDS_PAGE_SIZE, cardsTotalRows);
  const cardsPaginationItems = getCardsPaginationItems(cardsTotalPages, safeCardsPage);

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
      render: (row) => {
        const isDeleted = row.isDeleted === true;
        const label = isDeleted
          ? "Eliminado"
          : ACCOUNT_STATUS_LABELS[toAccountStatus(row.accountStatus)];
        const tone = isDeleted
          ? "deleted"
          : toAccountStatus(row.accountStatus);

        return (
          <span className={`users-status-cell users-status-cell--${tone}`}>
            <span className="users-status-dot" />
            {label}
          </span>
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
      key: "phone",
      name: "Telefono",
      align: "center",
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
      width: "120px",
      render: (row) => {
        const userId = typeof row.id === "string" ? row.id : "";
        const isSelfUser = row.isSelf === true;
        const isDeleted = row.isDeleted === true;
        const accountStatus = toAccountStatus(row.accountStatus);
        const nextStatus: AccountStatus =
          accountStatus === "active" ? "suspended" : "active";
        if (!userId) return null;
        return (
          <TableActionCell>
            {!isSelfUser && isDeleted ? (
              <WcButtonIcon
                variant="primary"
                shape="square"
                size="sm"
                className="users-table-action-icon"
                icon="icon-check"
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
                  icon={accountStatus === "active" ? "icon-lock" : "icon-check"}
                  title={accountStatus === "active" ? "Suspender usuario" : "Activar usuario"}
                  aria-label={accountStatus === "active" ? "Suspender usuario" : "Activar usuario"}
                  disabled={isTogglingStatus}
                  onClick={() => setSuspendConfirm({ userId, status: nextStatus })}
                />
                <WcButtonIcon
                  variant="danger"
                  shape="square"
                  size="sm"
                  className="users-table-action-icon"
                  icon="icon-trash"
                  title="Eliminar usuario"
                  aria-label="Eliminar usuario"
                  onClick={() => setDeleteConfirmId(userId)}
                />
              </>
            ) : null}
          </TableActionCell>
        );
      },
    },
  ];

  const openOrCloseFilterPanel = (placement: FilterPanelPlacement) => {
    setOpenFilterPanel((previous) => {
      const nextValue = previous === placement ? null : placement;
      if (nextValue !== null) {
        setDraftFilters(appliedFilters);
      }
      return nextValue;
    });
  };

  const applyDraftFilters = () => {
    setAppliedFilters(draftFilters);
    setOpenFilterPanel(null);
  };

  const clearFilters = () => {
    setDraftFilters(DEFAULT_USER_FILTERS);
    setAppliedFilters(DEFAULT_USER_FILTERS);
    setOpenFilterPanel(null);
  };

  const clearAllFiltersAndSearch = () => {
    clearFilters();
    setSearchInputValue("");
    setSearchValue("");
  };

  const removeFilterTag = (tagKey: string) => {
    if (tagKey === "search") {
      setSearchInputValue("");
      setSearchValue("");
      return;
    }

    const resetMap: Partial<UsersQuickFilterState> = {
      role: DEFAULT_USER_FILTERS.role,
      status: DEFAULT_USER_FILTERS.status,
      online: DEFAULT_USER_FILTERS.online,
      includeDeleted: DEFAULT_USER_FILTERS.includeDeleted,
    };

    const resetValue = resetMap[tagKey as keyof UsersQuickFilterState];
    if (resetValue === undefined) return;

    const next = { ...appliedFilters, [tagKey]: resetValue };
    setAppliedFilters(next);
    setDraftFilters(next);
  };

  const applySearch = () => {
    if (!isActivated) {
      loadUsers();
    }
    setSearchValue(searchInputValue.trim());
  };

  const renderSearchControls = (placement: FilterPanelPlacement) => (
    <div
      className={`users-filters-toolbar-top${placement === "header" ? " users-filters-toolbar-top--header" : ""}`}
    >
      <div className="users-filters-toolbar-actions">
        {placement === "header" ? (
          <WcButton
            variant="primary"
            onClick={() => setInviteModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}
          >
            <Icon name="icon-user-plus" size={14} />
            Agregar
          </WcButton>
        ) : null}
        {placement === "header" ? (
          <UsersQuickFilterPopover
            isOpen={openFilterPanel === placement}
            activeFiltersCount={appliedFiltersCount}
            filters={draftFilters}
            onToggle={() => openOrCloseFilterPanel(placement)}
            onChange={setDraftFilters}
            onClear={clearFilters}
            onApply={applyDraftFilters}
          />
        ) : null}
      </div>

      <div className="users-search-tools">
        {placement === "header" ? (
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
        ) : null}
        {placement === "panel" && isActivated && !isMobileViewport ? (
          <div className="users-view-toggle" role="group" aria-label="Modo de visualizacion">
            <button
              type="button"
              aria-pressed={viewMode === "table"}
              className={`users-view-toggle__btn users-view-toggle__btn--icon-only${viewMode === "table" ? " is-active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Vista en tabla"
              aria-label="Vista en tabla"
            >
              <Icon name="icon-table" size={14} />
            </button>
            <button
              type="button"
              aria-pressed={viewMode === "cards"}
              className={`users-view-toggle__btn users-view-toggle__btn--icon-only${viewMode === "cards" ? " is-active" : ""}`}
              onClick={() => setViewMode("cards")}
              title="Vista en tarjetas"
              aria-label="Vista en tarjetas"
            >
              <Icon name="icon-card" size={14} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  const selectedDeleteUser =
    deleteConfirmId !== null
      ? users.find((user) => user.id === deleteConfirmId) ?? null
      : null;

  const selectedRestoreUser =
    restoreConfirmId !== null
      ? users.find((user) => user.id === restoreConfirmId) ?? null
      : null;

  const selectedSuspendUser =
    suspendConfirm !== null
      ? users.find((user) => user.id === suspendConfirm.userId) ?? null
      : null;

  return (
    <div
      style={{
        padding: isMobileViewport ? "var(--space-3)" : "var(--space-6)",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "var(--space-1)" }}>
            Gestion de Usuarios
          </h1>
          <p style={{ fontSize: "var(--font-size-sm)" }}>
            Administre de forma segura el acceso y los perfiles de su organizacion
          </p>
        </div>
      </div>

      {isMobileViewport ? (
        <div className="users-mobile-top-controls">
          {renderSearchControls("header")}
        </div>
      ) : null}

      <WcTabsFolder
        headerExtra={!isMobileViewport ? (
          <div className="users-main-search-controls">
            {renderSearchControls("header")}
          </div>
        ) : undefined}
        tabs={[
          {
            name: "Usuarios",
            icon: <Icon name="icon-users" size={16} />,
            content: (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {isActivated ? renderSearchControls("panel") : null}

                {isActivated && filterTags.length > 0 ? (
                  <div className="users-active-filters-banner">
                    <div className="users-active-filters-banner__tags">
                      {filterTags.map((tag) => (
                        <span key={tag.key} className="users-active-filters-tag">
                          <span className="users-active-filters-tag__label">
                            {tag.label}
                          </span>
                          <button
                            type="button"
                            className="users-active-filters-tag__remove"
                            onClick={() => removeFilterTag(tag.key)}
                            title={`Quitar filtro: ${tag.label}`}
                            aria-label={`Quitar filtro: ${tag.label}`}
                          >
                            <Icon name="icon-x" size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="users-active-filters-banner__clear"
                      onClick={clearAllFiltersAndSearch}
                    >
                      Limpiar todo
                    </button>
                  </div>
                ) : null}

                {!isActivated ? (
                  <div className="users-load-cta">
                    <p className="users-load-cta__description">
                      Presione el boton para cargar los usuarios activos del sistema.
                    </p>
                    <WcButton
                      variant="primary"
                      onClick={loadUsers}
                      disabled={isLoading}
                    >
                      <Icon name="icon-users" size={14} />
                      Cargar usuarios
                    </WcButton>
                  </div>
                ) : isLoading ? (
                  <div className="card users-cards-empty">
                    Cargando usuarios...
                  </div>
                ) : userTableRows.length === 0 ? (
                  <div className="users-empty-state">
                    <Icon name="icon-users" size={32} />
                    {filtersAreNonDefault ? (
                      <>
                        <p className="users-empty-state__title">
                          Sin resultados
                        </p>
                        <p className="users-empty-state__description">
                          No se encontraron usuarios con los filtros aplicados.
                          Intente modificar los criterios de busqueda o limpiar los filtros.
                        </p>
                        <WcButton
                          variant="secondary"
                          onClick={clearAllFiltersAndSearch}
                        >
                          Limpiar filtros
                        </WcButton>
                      </>
                    ) : (
                      <>
                        <p className="users-empty-state__title">
                          No hay usuarios activos
                        </p>
                        <p className="users-empty-state__description">
                          No se encontraron usuarios activos en el sistema.
                          Puede invitar nuevos usuarios o ajustar los filtros para ver otros estados.
                        </p>
                      </>
                    )}
                  </div>
                ) : !isMobileViewport && viewMode === "table" ? (
                  <div>
                    <WcTables
                      columns={userColumns}
                      rows={userTableRows}
                      emptyMessage="No hay usuarios registrados"
                      pageSize={10}
                    />
                  </div>
                ) : (
                  <div className="users-cards-view">
                    <div className="users-cards-grid">
                      {paginatedCardRows.map((row) => {
                        const roleValue = typeof row.role === "string" ? row.role : "";
                        const roleLabel = isUserRole(roleValue) ? USER_ROLE_LABELS[roleValue] : "--";
                        const statusLabel = row.isDeleted
                          ? "Eliminado"
                          : ACCOUNT_STATUS_LABELS[toAccountStatus(row.accountStatus)];
                        const userId = typeof row.id === "string" ? row.id : "";
                        const accountStatus = toAccountStatus(row.accountStatus);
                        const nextStatus: AccountStatus =
                          accountStatus === "active" ? "suspended" : "active";

                        return (
                          <WcUserCard
                            key={row.id}
                            avatarUrl={typeof row.avatarUrl === "string" ? row.avatarUrl : undefined}
                            fullName={typeof row.fullName === "string" ? row.fullName : "--"}
                            email={typeof row.email === "string" ? row.email : "--"}
                            roleLabel={roleLabel}
                            statusLabel={statusLabel}
                            phone={typeof row.phone === "string" ? row.phone : "--"}
                            lastSeen={formatDateTime(typeof row.lastSeen === "string" ? row.lastSeen : null)}
                            canManage={!row.isSelf && Boolean(userId)}
                            isDeleted={row.isDeleted === true}
                            isTogglingStatus={isTogglingStatus}
                            isRestoring={isRestoring}
                            statusActionIcon={accountStatus === "active" ? "icon-lock" : "icon-check"}
                            statusActionLabel={accountStatus === "active" ? "Suspender usuario" : "Activar usuario"}
                            onToggleStatus={() => setSuspendConfirm({ userId, status: nextStatus })}
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
                            onClick={() => setCardsCurrentPage((previous) => Math.max(1, previous - 1))}
                            disabled={safeCardsPage === 1}
                            aria-label="Pagina anterior"
                          >
                            {"<"}
                          </WcButton>

                          {cardsPaginationItems.map((item, index) =>
                            item === "ellipsis" ? (
                              <span key={`cards-ellipsis-${index}`} className="users-cards-pagination__ellipsis">
                                ...
                              </span>
                            ) : (
                              <WcButton
                                key={`cards-page-${item}`}
                                variant={safeCardsPage === item ? "primary" : "secondary"}
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
                            onClick={() => setCardsCurrentPage((previous) => Math.min(cardsTotalPages, previous + 1))}
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
        <ConfirmUserActionModal
          variant="danger"
          title="Confirmar Eliminacion"
          message={
            <>Estas seguro de que deseas eliminar a <strong style={{ color: "var(--color-text)" }}>{selectedDeleteUser.firstName} {selectedDeleteUser.lastName}</strong>?</>
          }
          detail="Esta accion deshabilitara su acceso al sistema. Los datos del usuario se conservaran para trazabilidad de registros medicos."
          confirmLabel="Si, Eliminar"
          loadingLabel="Eliminando..."
          isLoading={isSoftDeleting}
          onConfirm={() => handleDelete(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {restoreConfirmId && selectedRestoreUser && (
        <ConfirmUserActionModal
          variant="primary"
          title="Confirmar Restauracion"
          message={
            <>Estas seguro de que deseas restaurar a <strong style={{ color: "var(--color-text)" }}>{selectedRestoreUser.firstName} {selectedRestoreUser.lastName}</strong>?</>
          }
          detail="Al restaurar este usuario, su cuenta sera reactivada y podra iniciar sesion nuevamente con acceso completo al sistema segun su rol asignado."
          confirmLabel="Si, Restaurar"
          loadingLabel="Restaurando..."
          isLoading={isRestoring}
          onConfirm={handleConfirmRestore}
          onCancel={() => setRestoreConfirmId(null)}
        />
      )}

      {suspendConfirm && selectedSuspendUser && (
        <ConfirmUserActionModal
          variant={suspendConfirm.status === "suspended" ? "danger" : "primary"}
          title={suspendConfirm.status === "suspended" ? "Confirmar Suspension" : "Confirmar Activacion"}
          message={
            suspendConfirm.status === "suspended"
              ? <>Estas seguro de que deseas suspender a <strong style={{ color: "var(--color-text)" }}>{selectedSuspendUser.firstName} {selectedSuspendUser.lastName}</strong>?</>
              : <>Estas seguro de que deseas activar a <strong style={{ color: "var(--color-text)" }}>{selectedSuspendUser.firstName} {selectedSuspendUser.lastName}</strong>?</>
          }
          detail={
            suspendConfirm.status === "suspended"
              ? "El usuario no podra iniciar sesion ni acceder al sistema mientras su cuenta permanezca suspendida. Podra reactivarla en cualquier momento."
              : "El usuario podra iniciar sesion y acceder al sistema nuevamente con los permisos de su rol asignado."
          }
          confirmLabel={suspendConfirm.status === "suspended" ? "Si, Suspender" : "Si, Activar"}
          loadingLabel={suspendConfirm.status === "suspended" ? "Suspendiendo..." : "Activando..."}
          isLoading={isTogglingStatus}
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

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

import type { ReactNode } from "react";

type ConfirmUserActionModalProps = {
  variant: "danger" | "primary";
  title: string;
  message: ReactNode;
  detail: string;
  confirmLabel: string;
  loadingLabel: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmUserActionModal(props: ConfirmUserActionModalProps) {
  const confirmVariant = props.variant === "danger" ? "danger" : "primary";
  const titleColor =
    props.variant === "danger" ? "var(--color-danger)" : "var(--color-primary)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--space-4)",
      }}
      onClick={props.onCancel}
    >
      <div
        className="card"
        style={{ maxWidth: "480px", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            marginBottom: "var(--space-3)",
            color: titleColor,
          }}
        >
          {props.title}
        </h3>
        <p style={{ marginBottom: "var(--space-2)" }}>
          {props.message}
        </p>
        <p
          style={{
            marginBottom: "var(--space-6)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-secondary)",
          }}
        >
          {props.detail}
        </p>
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            justifyContent: "flex-end",
          }}
        >
          <WcButton
            variant="terciary"
            onClick={props.onCancel}
            disabled={props.isLoading}
          >
            <Icon name="icon-x" size={14} />
            Cancelar
          </WcButton>
          <WcButton
            variant={confirmVariant}
            onClick={props.onConfirm}
            disabled={props.isLoading}
          >
            <Icon name="icon-check" size={14} />
            {props.isLoading ? props.loadingLabel : props.confirmLabel}
          </WcButton>
        </div>
      </div>
    </div>
  );
}
