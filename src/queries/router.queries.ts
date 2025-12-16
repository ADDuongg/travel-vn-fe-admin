import { useQuery } from '@tanstack/react-query';
import { getRouters } from '@/services/router.service';

export const ROUTER_QUERY_KEYS = {
  LIST: ['routers'] as const,
};

export function useRouters() {
  return useQuery({
    queryKey: ROUTER_QUERY_KEYS.LIST,
    queryFn: getRouters,
  });
}
