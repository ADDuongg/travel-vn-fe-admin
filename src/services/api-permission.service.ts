import api from '@/lib/axios';

export type ApiPermission = {
  _id: string;
  code: string;
  name: string;
  path: string;
  method: string;
  isActive: boolean;
};

export const getApiPermissions = () =>
  api.get<ApiPermission[]>('/api/v1/api-permissions');

export const createApiPermission = (data: Partial<ApiPermission>) =>
  api.post('/api/v1/api-permissions', data);

export const updateApiPermission = (
  code: string,
  data: Partial<ApiPermission>,
) => api.put(`/api/v1/api-permissions/${code}`, data);

export const deleteApiPermission = (code: string) =>
  api.delete(`/api/v1/api-permissions/${code}`);
