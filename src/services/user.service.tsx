import api from '@/lib/axios';

export type User = {
  _id: string;
  username: string;
  email?: string;
  roles: string[];
  isActive: boolean;
  fullName?: string;
  phone?: string;
  isSuperAdmin?: boolean;
  permissions?: string[];
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?:
    | string
    | {
        provinceId?: string;
        districtCode?: string;
        wardCode?: string;
        detail?: string;
      };
  avatar?: { url?: string; publicId?: string };
};

export type CreateUserPayload = {
  username: string;
  password?: string;
  email: string;
  isActive?: boolean;
  roles?: string[];
  permissions?: Record<string, unknown>;
  fullName?: string;
  phone?: string;
  avatar?: { url?: string; publicId?: string };
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?:
    | string
    | {
        provinceId?: string;
        districtCode?: string;
        wardCode?: string;
        detail?: string;
      };
};

export type UpdateUserPayload = Partial<CreateUserPayload>;

const BASE = '/api/v1/admin/users';

export const getUsers = async (): Promise<User[]> => {
  return api.get<User[]>(BASE);
};

export const getUserById = async (id: string): Promise<User | null> => {
  return api.get<User | null>(`${BASE}/${id}`);
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  return api.post<User, CreateUserPayload>(BASE, payload);
};

export const updateUser = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<User> => {
  return api.patch<User, UpdateUserPayload>(`${BASE}/${id}`, payload);
};

export const resetUserPassword = async (id: string): Promise<User | null> => {
  return api.patch<User | null, object>(`${BASE}/${id}/reset-password`, {});
};

export const deleteUser = async (id: string): Promise<User | null> => {
  return api.delete<User | null>(`${BASE}/${id}`);
};
