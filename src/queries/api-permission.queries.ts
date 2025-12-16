import { useQuery } from '@tanstack/react-query';
import { getApiPermissions } from '@/services/api-permission.service';

export const API_PERMISSION_QUERY_KEYS = {
  LIST: ['api-permissions'] as const,
};

export function useApiPermissions() {
  return useQuery({
    queryKey: API_PERMISSION_QUERY_KEYS.LIST,
    queryFn: getApiPermissions,
  });
}
