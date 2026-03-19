import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupabaseUserRepository } from "@/infrastructure/modules/users/repositories/SupabaseUserRepository";
import { InviteUser } from "@/application/modules/users/use-cases/inviteUser";
import { ToggleUserStatus } from "@/application/modules/users/use-cases/toggleUserStatus";
import { SoftDeleteUser } from "@/application/modules/users/use-cases/softDeleteUser";
import type { AccountStatus, InviteUserPayload } from "@/domain/modules/users/models/User";

const userRepository = new SupabaseUserRepository();
const inviteUseCase = new InviteUser(userRepository);
const toggleStatusUseCase = new ToggleUserStatus(userRepository);
const softDeleteUseCase = new SoftDeleteUser(userRepository);

export const ADMIN_USERS_QUERY_KEY = ["admin", "users", "table"] as const;

const FIVE_MINUTES = 1000 * 60 * 5;
const TEN_MINUTES = 1000 * 60 * 10;

export function useAdminUsers() {
  const queryClient = useQueryClient();
  const [isActivated, setIsActivated] = useState(() => {
    return !!queryClient.getQueryData(ADMIN_USERS_QUERY_KEY);
  });

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: () => userRepository.getAllUsers(),
    enabled: isActivated,
    staleTime: FIVE_MINUTES,
    gcTime: TEN_MINUTES,
  });

  const allUsers = users ?? [];

  const activeUsers = useMemo(() => allUsers.filter((u) => !u.deletedAt), [allUsers]);

  const deletedUsers = useMemo(() => allUsers.filter((u) => u.deletedAt), [allUsers]);

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

  return {
    users: allUsers,
    activeUsers,
    deletedUsers,
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
  };
}
