import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupabaseUserRepository } from "@/infrastructure/modules/users/repositories/SupabaseUserRepository";
import { InviteUser } from "@/application/modules/users/use-cases/inviteUser";
import { ToggleUserStatus } from "@/application/modules/users/use-cases/toggleUserStatus";
import { SoftDeleteUser } from "@/application/modules/users/use-cases/softDeleteUser";
import { RestoreDeletedUser } from "@/application/modules/users/use-cases/restoreDeletedUser";
import { GetFilteredUsers } from "@/application/modules/users/use-cases/getFilteredUsers";
import type { AccountStatus, InviteUserPayload, UserFilters } from "@/domain/modules/users/models/User";
import { useUserStore } from "@/presentation/modules/users/stores/useUserStore";

const userRepository = new SupabaseUserRepository();
const inviteUseCase = new InviteUser(userRepository);
const toggleStatusUseCase = new ToggleUserStatus(userRepository);
const softDeleteUseCase = new SoftDeleteUser(userRepository);
const restoreDeletedUseCase = new RestoreDeletedUser(userRepository);
const getFilteredUseCase = new GetFilteredUsers(userRepository);

export const ADMIN_USERS_QUERY_KEY = ["admin", "users", "table"] as const;

const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_MINUTES = 1000 * 60 * 30;

export function useAdminUsers(filters: UserFilters = {}) {
  const queryClient = useQueryClient();
  const isActivated = useUserStore((state) => state.isUsersLoaded);
  const setIsActivated = useUserStore((state) => state.setUsersLoaded);

  const queryKey = [...ADMIN_USERS_QUERY_KEY, filters];

  const hasCachedData = queryClient.getQueryData(queryKey) !== undefined;

  useEffect(() => {
    if (hasCachedData && !isActivated) {
      setIsActivated(true);
    }
  }, [hasCachedData, isActivated, setIsActivated]);

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => getFilteredUseCase.execute(filters),
    enabled: isActivated,
    staleTime: FIVE_MINUTES,
    gcTime: THIRTY_MINUTES,
  });

  const loadUsers = () => setIsActivated(true);

  const inviteMutation = useMutation({
    mutationFn: (payload: InviteUserPayload) => inviteUseCase.execute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: AccountStatus }) =>
      toggleStatusUseCase.execute(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (userId: string) => softDeleteUseCase.execute(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (userId: string) => restoreDeletedUseCase.execute(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  return {
    users: users ?? [],
    isLoading,
    isActivated,
    error,
    loadUsers,
    inviteUser: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    inviteError: inviteMutation.error,
    toggleUserStatus: toggleStatusMutation.mutateAsync,
    isTogglingStatus: toggleStatusMutation.isPending,
    softDeleteUser: softDeleteMutation.mutateAsync,
    isSoftDeleting: softDeleteMutation.isPending,
    restoreDeletedUser: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
  };
}
