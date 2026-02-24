import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authUtils } from '@/lib/auth-token';
import { useAuthStore } from '@/stores/useAuthStore';
import type { LoginFormValues, LoginPayload } from '@/interface/auth';
import {
  getMe,
  login,
  logout,
  refresh,
  register,
} from '@/services/auth.service';
import { ROUTES } from '@/constants/route.constant';

export const authKeyQuery = {
  all: ['auth'] as const,
  me: ['me'] as const,
};

function syncUserRole(account?: LoginPayload['account']) {
  const role = account?.roles?.[0]?.toLowerCase();
  if (role) {
    localStorage.setItem('userRole', role);
  }
}

function clearUserRole() {
  localStorage.removeItem('userRole');
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const mutation = useMutation<LoginPayload, Error, LoginFormValues>({
    mutationFn: login,
    onSuccess: (data) => {
      authUtils.setAccessToken(data.access_token);
      setUser(data.account);
      syncUserRole(data.account);
      queryClient.removeQueries({ queryKey: authKeyQuery.me });
      navigate(ROUTES.DASHBOARD);
    },
  });
  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
  };
}

export function useRegister() {
  const queryClient = useQueryClient();
  const mutation = useMutation<LoginPayload, Error, LoginFormValues>({
    mutationFn: register,
    onSuccess: (data) => {
      authUtils.setAccessToken(data.access_token);
      queryClient.removeQueries({ queryKey: authKeyQuery.me });
    },
  });
  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
  };
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearUser = useAuthStore((s) => s.clearUser);

  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      authUtils.clearAccessToken();
      clearUser();
      clearUserRole();
      queryClient.removeQueries({ queryKey: authKeyQuery.me });
      navigate(ROUTES.LOGIN);
    },
  });
  return {
    logout: mutation.mutate,
    isPending: mutation.isPending,
  };
}

export function useMe() {
  return useQuery({
    queryKey: authKeyQuery.me,
    queryFn: () => getMe(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useRefresh() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const mutation = useMutation({
    mutationFn: refresh,
    onSuccess: (data) => {
      authUtils.setAccessToken(data.access_token);
      setUser(data.account);
      syncUserRole(data.account);
      queryClient.removeQueries({ queryKey: authKeyQuery.me });
    },
  });
  return {
    refresh: mutation.mutate,
  };
}
