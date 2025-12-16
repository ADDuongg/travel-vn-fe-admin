import api from '@/lib/axios';
export type Role = {
  _id: string;
  code: string;
  name: string;
};

export const getRoles = async (): Promise<Role[]> => {
  return api.get<Role[]>('/api/v1/roles');
};
