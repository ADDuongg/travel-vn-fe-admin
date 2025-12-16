import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getApiRolesByRole,
  replaceApiRoles,
} from '@/services/api-role.service';

export const API_ROLE_QUERY_KEYS = {
  BY_ROLE: (roleCode: string) => ['api-roles', roleCode] as const,
};

export function useApiRoles(roleCode?: string) {
  return useQuery({
    queryKey: API_ROLE_QUERY_KEYS.BY_ROLE(roleCode ?? ''),
    queryFn: () => getApiRolesByRole(roleCode!),
    enabled: !!roleCode,
  });
}

export function useReplaceApiRoles() {
  return useMutation({
    mutationFn: ({
      roleCode,
      apiCodes,
    }: {
      roleCode: string;
      apiCodes: string[];
    }) => replaceApiRoles(roleCode, apiCodes),
  });
}
