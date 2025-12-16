import api from '@/lib/axios';
export type RouterRole = {
  _id: string;
  roleCode: string;
  routerCode: string;
};

export const getRouterRolesByRole = async (
  roleCode: string,
): Promise<RouterRole[]> => {
  return api.get<RouterRole[]>(`/api/v1/router-roles/role/${roleCode}`);
};

export const replaceRouterRoles = async (
  roleCode: string,
  routerCodes: string[],
) => {
  return api.post(`/api/v1/router-roles/replace/${roleCode}`, {
    routerCodes,
  });
};
