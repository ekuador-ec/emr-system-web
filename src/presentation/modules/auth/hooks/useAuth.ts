import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { SupabaseAuthRepository } from "@/infrastructure/modules/auth/repositories/SupabaseAuthRepository";
import { SupabaseUserRepository } from "@/infrastructure/modules/users/repositories/SupabaseUserRepository";
import { LoginUser } from "@/application/modules/auth/use-cases/loginUser";
import { LogoutUser } from "@/application/modules/auth/use-cases/logoutUser";
import { MarkPresenceOffline } from "@/application/modules/users/use-cases/markPresenceOffline";
import type { UserProfile } from "@/domain/modules/users/models/User";
import { clearAllDrafts } from "@/infrastructure/core/draftCache";
import { useMessagingUIStore } from "@/presentation/modules/messaging/stores/useMessagingUIStore";
import { useAiAssistantStore } from "@/presentation/modules/ai/stores/useAiAssistantStore";
import { usePresenceStore } from "@/presentation/modules/users/stores/usePresenceStore";

const authRepository = new SupabaseAuthRepository();
const userRepository = new SupabaseUserRepository();
const loginUseCase = new LoginUser(authRepository);
const logoutUseCase = new LogoutUser(authRepository);
const markPresenceOfflineUseCase = new MarkPresenceOffline(userRepository);

export const AUTH_QUERY_KEY = ["auth", "currentUser"] as const;

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authRepository.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  useEffect(() => {
    const unsubscribe = authRepository.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    });
    return unsubscribe;
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUseCase.execute(email, password),
    onSuccess: (profile) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, profile);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const currentUser = queryClient.getQueryData<UserProfile>(AUTH_QUERY_KEY);
      if (currentUser?.id) {
        await markPresenceOfflineUseCase.execute(currentUser.id);
      }
      await logoutUseCase.execute();
    },
    onSuccess: () => {
      clearAllDrafts();
      useMessagingUIStore.getState().reset();
      useAiAssistantStore.getState().reset();
      usePresenceStore.getState().reset();
      queryClient.clear();
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    error,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
