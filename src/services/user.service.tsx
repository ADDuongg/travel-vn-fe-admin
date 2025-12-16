import api from '@/lib/axios';
export type User = {
  _id: string;
  username: string;
  email?: string;
  roles: string[];
  isActive: boolean;
};

export const getUsers = async (): Promise<User[]> => {
  return api.get<User[]>('/api/v1/users');
};

export const updateUser = async (
  id: string,
  payload: Partial<User>,
): Promise<User> => {
  return api.patch<User, Partial<User>>(`/api/v1/users/${id}`, payload);
};
