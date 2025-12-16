import { getRoles } from '@/services/role.service';
import { useQuery } from '@tanstack/react-query';
export const ROLE_QUERY_KEYS = {
  LIST: ['roles'] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: ROLE_QUERY_KEYS.LIST,
    queryFn: getRoles,
  });
}
