import api from '@/lib/axios';
export type ApiRole = {
  _id: string;
  roleCode: string;
  apiCode: string;
};

export const getApiRolesByRole = async (
  roleCode: string,
): Promise<ApiRole[]> => {
  return api.get<ApiRole[]>(`/api/v1/api-roles/role/${roleCode}`);
};

export const replaceApiRoles = async (roleCode: string, apiCodes: string[]) => {
  return api.post(`/api/v1/api-roles/replace/${roleCode}`, {
    apiCodes,
  });
};
