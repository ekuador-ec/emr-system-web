import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { useAdminUsers } from "@/presentation/modules/users/hooks/useAdminUsers";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import type {
  AccountStatus,
  UserProfile,
  UserWithPresence,
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
  role: "all",
  status: "active",
  online: "all",
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function countAppliedFilters(filters: UsersQuickFilterState): number {
  let count = 0;

  if (filters.role !== DEFAULT_USER_FILTERS.role) count += 1;
  if (filters.status !== DEFAULT_USER_FILTERS.status) count += 1;
  if (filters.online !== DEFAULT_USER_FILTERS.online) count += 1;

  return count;
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
  const {
    activeUsers,
    deletedUsers,
    isLoading,
    isActivated,
    loadUsers,
    toggleUserStatus,
    isTogglingStatus,
    softDeleteUser,
    isSoftDeleting,
  } = useAdminUsers();

  const { addToast } = useToastStore();

  const { setInviteModalOpen, setUsersLoaded } = useUserStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [openFilterPanel, setOpenFilterPanel] = useState<FilterPanelPlacement | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches
      : false,
  );
  const [viewMode, setViewMode] = useState<UsersViewMode>("table");
  const [hydratedViewModeKey, setHydratedViewModeKey] = useState<string | null>(null);
  const [cardsCurrentPage, setCardsCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] =
    useState<UsersQuickFilterState>(DEFAULT_USER_FILTERS);
  const [draftFilters, setDraftFilters] =
    useState<UsersQuickFilterState>(DEFAULT_USER_FILTERS);

  const handleToggleStatus = async (params: {
    userId: string;
    status: AccountStatus;
  }) => {
    await toggleUserStatus(params);
    const label = params.status === "suspended" ? "suspendida" : "activada";
    addToast({ type: "success", message: `Cuenta ${label} exitosamente` });
  };

  const handleDelete = async (userId: string) => {
    await softDeleteUser(userId);
    setDeleteConfirmId(null);
    addToast({ type: "success", message: "Usuario eliminado exitosamente" });
  };

  useEffect(() => {
    setUsersLoaded(false);
  }, [setUsersLoaded]);

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

  const allUsers = useMemo(
    () => [...activeUsers, ...deletedUsers],
    [activeUsers, deletedUsers],
  );
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

  const filteredUsers = useMemo(() => {
    const normalizedSearch = normalizeText(searchValue);

    return allUsers.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      const isDeleted = Boolean(user.deletedAt);

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          normalizeText(fullName),
          normalizeText(user.email),
        ].some((value) => value.includes(normalizedSearch));

      const matchesActiveLifecycle = !isDeleted;

      const matchesRole =
        appliedFilters.role === "all" ||
        user.role === appliedFilters.role;

      const matchesStatus =
        appliedFilters.status === "all" ||
        user.accountStatus === appliedFilters.status;

      const matchesOnline =
        appliedFilters.online === "all" ||
        (appliedFilters.online === "online" && user.isOnline) ||
        (appliedFilters.online === "offline" && !user.isOnline);

      return (
        matchesSearch &&
        matchesActiveLifecycle &&
        matchesRole &&
        matchesStatus &&
        matchesOnline
      );
    });
  }, [allUsers, appliedFilters, searchValue]);

  const userTableRows: UserTableRow[] = filteredUsers.map((user) => ({
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
      key: "accountStatus",
      name: "Estado",
      align: "center",
      render: (row) =>
        row.isDeleted
          ? "Eliminado"
          : ACCOUNT_STATUS_LABELS[toAccountStatus(row.accountStatus)],
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
            {!isSelfUser && !isDeleted ? (
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
                  onClick={() => handleToggleStatus({ userId, status: nextStatus })}
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
      ? allUsers.find((user) => user.id === deleteConfirmId) ?? null
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
                {!isActivated ? (
                  <div className="users-load-cta">
                    <p className="users-load-cta__description">
                      Presione el boton para cargar  los usuarios.
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
                ) : !isMobileViewport && viewMode === "table" ? (
                  <div>
                    <WcTables
                      columns={userColumns}
                      rows={userTableRows}
                      emptyMessage={isLoading ? "Cargando usuarios..." : "No hay usuarios registrados"}
                      pageSize={10}
                    />
                  </div>
                ) : (
                  <div className="users-cards-view">
                    {userTableRows.length === 0 ? (
                      <div className="card users-cards-empty">
                        {isLoading ? "Cargando usuarios..." : "No hay usuarios registrados"}
                      </div>
                    ) : (
                      <>
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
                                canManage={!row.isSelf && !row.isDeleted && Boolean(userId)}
                                isTogglingStatus={isTogglingStatus}
                                statusActionIcon={accountStatus === "active" ? "icon-lock" : "icon-check"}
                                statusActionLabel={accountStatus === "active" ? "Suspender usuario" : "Activar usuario"}
                                onToggleStatus={() => handleToggleStatus({ userId, status: nextStatus })}
                                onDelete={() => setDeleteConfirmId(userId)}
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
                      </>
                    )}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      {deleteConfirmId && selectedDeleteUser && (
        <ConfirmDeleteModal
          user={selectedDeleteUser}
          onConfirm={() => handleDelete(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
          isDeleting={isSoftDeleting}
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

function ConfirmDeleteModal({
  user,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  user: UserWithPresence;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
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
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ maxWidth: "480px", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            marginBottom: "var(--space-3)",
            color: "var(--color-danger)",
          }}
        >
          Confirmar Eliminacion
        </h3>
        <p style={{ marginBottom: "var(--space-2)" }}>
          Estas seguro de que deseas eliminar a{" "}
          <strong style={{ color: "var(--color-text)" }}>
            {user.firstName} {user.lastName}
          </strong>
          ?
        </p>
        <p
          style={{
            marginBottom: "var(--space-6)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-secondary)",
          }}
        >
          Esta accion deshabilitara su acceso al sistema. Los datos del usuario
          se conservaran para trazabilidad de registros medicos. Esta accion no
          se puede deshacer facilmente.
        </p>
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            justifyContent: "flex-end",
          }}
        >
          <WcButton
            variant="secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </WcButton>
          <WcButton
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Si, Eliminar"}
          </WcButton>
        </div>
      </div>
    </div>
  );
}
