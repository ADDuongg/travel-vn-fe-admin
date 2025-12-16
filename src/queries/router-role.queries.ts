import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getRouterRolesByRole,
  replaceRouterRoles,
} from '@/services/router-role.service';

export const ROUTER_ROLE_QUERY_KEYS = {
  BY_ROLE: (roleCode: string) => ['router-roles', roleCode] as const,
};

export function useRouterRoles(roleCode?: string) {
  return useQuery({
    queryKey: ROUTER_ROLE_QUERY_KEYS.BY_ROLE(roleCode ?? ''),
    queryFn: () => getRouterRolesByRole(roleCode!),
    enabled: !!roleCode,
  });
}

export function useReplaceRouterRoles() {
  return useMutation({
    mutationFn: ({
      roleCode,
      routerCodes,
    }: {
      roleCode: string;
      routerCodes: string[];
    }) => replaceRouterRoles(roleCode, routerCodes),
  });
}
