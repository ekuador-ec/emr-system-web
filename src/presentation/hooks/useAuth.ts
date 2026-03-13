import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { SupabaseAuthRepository } from "@/infrastructure/repositories/SupabaseAuthRepository";
import { LoginUser } from "@/application/use-cases/loginUser";
import { LogoutUser } from "@/application/use-cases/logoutUser";

const authRepository = new SupabaseAuthRepository();
const loginUseCase = new LoginUser(authRepository);
const logoutUseCase = new LogoutUser(authRepository);

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
    mutationFn: () => logoutUseCase.execute(),
    onSuccess: () => {
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
