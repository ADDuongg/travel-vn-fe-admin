import api from '@/lib/axios';
export type ApiPermission = {
  _id: string;
  code: string;
  name: string;
  path: string;
  method: string;
};

export const getApiPermissions = async (): Promise<ApiPermission[]> => {
  return api.get<ApiPermission[]>('/api/v1/api-permissions');
};
