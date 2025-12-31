import api from '@/lib/axios';

export type Role = {
  _id: string;
  code: string;
  name: string;
};

/** GET */
export const getRoles = async (): Promise<Role[]> => {
  return api.get<Role[]>('/api/v1/roles');
};

/** CREATE */
export const createRole = async (
  data: Pick<Role, 'code' | 'name'>,
): Promise<Role> => {
  return api.post<Role>('/api/v1/roles', data);
};

/** UPDATE */
export const updateRole = async (
  code: string,
  data: Partial<Pick<Role, 'name'>>,
): Promise<Role> => {
  return api.put<Role>(`/api/v1/roles/${code}`, data);
};

/** DELETE */
export const deleteRole = async (code: string) => {
  return api.delete(`/api/v1/roles/${code}`);
};
