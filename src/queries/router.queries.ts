import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRouter,
  deleteRouter,
  getRouters,
  updateRouter,
} from '@/services/router.service';

export const ROUTER_QUERY_KEYS = {
  LIST: ['routers'] as const,
};

export const useRouters = () =>
  useQuery({
    queryKey: ROUTER_QUERY_KEYS.LIST,
    queryFn: getRouters,
  });

export const useCreateRouter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRouter,
    onSuccess: () => qc.invalidateQueries({ queryKey: ROUTER_QUERY_KEYS.LIST }),
  });
};

export const useUpdateRouter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: any) => updateRouter(code, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROUTER_QUERY_KEYS.LIST }),
  });
};

export const useDeleteRouter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRouter,
    onSuccess: () => qc.invalidateQueries({ queryKey: ROUTER_QUERY_KEYS.LIST }),
  });
};
