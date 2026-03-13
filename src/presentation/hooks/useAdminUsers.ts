import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupabaseUserRepository } from "@/infrastructure/repositories/SupabaseUserRepository";
import { InviteUser } from "@/application/use-cases/inviteUser";
import { ToggleUserStatus } from "@/application/use-cases/toggleUserStatus";
import { SoftDeleteUser } from "@/application/use-cases/softDeleteUser";
import type { AccountStatus, InviteUserPayload } from "@/domain/models/User";

const userRepository = new SupabaseUserRepository();
const inviteUseCase = new InviteUser(userRepository);
const toggleStatusUseCase = new ToggleUserStatus(userRepository);
const softDeleteUseCase = new SoftDeleteUser(userRepository);

export const ADMIN_USERS_QUERY_KEY = ["admin", "users"] as const;

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: () => userRepository.getAllUsers(),
    staleTime: 1000 * 30,
  });

  const inviteMutation = useMutation({
    mutationFn: (payload: InviteUserPayload) => inviteUseCase.execute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: AccountStatus }) =>
      toggleStatusUseCase.execute(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (userId: string) => softDeleteUseCase.execute(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });

  return {
    users: users ?? [],
    isLoading,
    error,
    refetch,
    inviteUser: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    inviteError: inviteMutation.error,
    toggleUserStatus: toggleStatusMutation.mutateAsync,
    isTogglingStatus: toggleStatusMutation.isPending,
    softDeleteUser: softDeleteMutation.mutateAsync,
    isSoftDeleting: softDeleteMutation.isPending,
  };
}
