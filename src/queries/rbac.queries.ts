import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRbacPermissionsCatalog,
  getRolePermissionKeys,
  replaceRolePermissions,
  type ReplaceRolePermissionsResponse,
} from '@/services/rbac.service';

export const RBAC_QUERY_KEYS = {
  catalog: ['rbac', 'catalog'] as const,
  roleKeys: (roleId: string) => ['rbac', 'role-keys', roleId] as const,
};

export function useRbacCatalog() {
  return useQuery({
    queryKey: RBAC_QUERY_KEYS.catalog,
    queryFn: getRbacPermissionsCatalog,
  });
}

export function useRoleRbacKeys(roleId: string | undefined) {
  return useQuery({
    queryKey: roleId ? RBAC_QUERY_KEYS.roleKeys(roleId) : ['rbac', 'role-keys', 'none'],
    queryFn: () => getRolePermissionKeys(roleId!),
    enabled: Boolean(roleId),
  });
}

export function useReplaceRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionKeys,
    }: {
      roleId: string;
      permissionKeys: string[];
    }) => replaceRolePermissions(roleId, permissionKeys),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: RBAC_QUERY_KEYS.roleKeys(variables.roleId),
      });
    },
  });
}

export type { ReplaceRolePermissionsResponse };
