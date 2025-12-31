import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from '@/services/role.service';

export const ROLE_QUERY_KEYS = {
  LIST: ['roles'] as const,
};

export const useRoles = () =>
  useQuery({
    queryKey: ROLE_QUERY_KEYS.LIST,
    queryFn: getRoles,
  });

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.LIST }),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, name }: { code: string; name: string }) =>
      updateRole(code, { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.LIST }),
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.LIST }),
  });
};
