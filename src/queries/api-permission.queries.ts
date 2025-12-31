import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createApiPermission,
  deleteApiPermission,
  getApiPermissions,
  updateApiPermission,
} from '@/services/api-permission.service';

export const API_PERMISSION_KEYS = {
  LIST: ['api-permissions'] as const,
};

export const useApiPermissions = () =>
  useQuery({
    queryKey: API_PERMISSION_KEYS.LIST,
    queryFn: getApiPermissions,
  });

export const useCreateApiPermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createApiPermission,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: API_PERMISSION_KEYS.LIST }),
  });
};

export const useUpdateApiPermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: any) => updateApiPermission(code, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: API_PERMISSION_KEYS.LIST }),
  });
};

export const useDeleteApiPermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteApiPermission,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: API_PERMISSION_KEYS.LIST }),
  });
};
