import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRole,
  deleteRole,
  getRoles,
  patchRole,
  type CreateRoleBody,
  type UpdateRoleBody,
} from '@/services/role.service';

export const ROLE_QUERY_KEYS = {
  LIST: ['roles'] as const,
  DETAIL: (id: string) => ['roles', id] as const,
};

export const useRoles = () =>
  useQuery({
    queryKey: ROLE_QUERY_KEYS.LIST,
    queryFn: getRoles,
  });

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleBody) => createRole(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.LIST }),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleBody }) =>
      patchRole(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.LIST });
      qc.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.DETAIL(variables.id) });
    },
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.LIST }),
  });
};
