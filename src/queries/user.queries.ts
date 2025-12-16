import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUser } from '@/services/user.service';

export const USER_QUERY_KEYS = {
  LIST: ['users'] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.LIST,
    queryFn: getUsers,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateUser(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USER_QUERY_KEYS.LIST });
    },
  });
}
