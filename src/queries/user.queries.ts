import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  resetUserPassword,
  updateUser,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '@/services/user.service';

export const USER_QUERY_KEYS = {
  LIST: ['users'] as const,
  DETAIL: (id: string) => ['users', id] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.LIST,
    queryFn: getUsers,
  });
}

export function useUserDetail(id?: string) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.DETAIL(id ?? ''),
    queryFn: () => getUserById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.LIST });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.LIST });
      qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.DETAIL(id) });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.LIST });
      qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.DETAIL(id) });
    },
  });
}

export function useResetUserPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resetUserPassword(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.LIST });
      qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.DETAIL(id) });
    },
  });
}
