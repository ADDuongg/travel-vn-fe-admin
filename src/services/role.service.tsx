import api from '@/lib/axios';

const BASE = '/api/v1/admin/roles';

export type Role = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateRoleBody = {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateRoleBody = Partial<
  Omit<CreateRoleBody, 'code'>
> & { code?: string };

export async function getRoles(): Promise<Role[]> {
  return api.get<Role[]>(BASE);
}

export async function getRoleById(id: string): Promise<Role> {
  return api.get<Role>(`${BASE}/${id}`);
}

export async function createRole(data: CreateRoleBody): Promise<Role> {
  return api.post<Role>(BASE, data);
}

export async function patchRole(id: string, data: UpdateRoleBody): Promise<Role> {
  return api.patch<Role>(`${BASE}/${id}`, data);
}

export async function deleteRole(id: string): Promise<void> {
  return api.delete(`${BASE}/${id}`);
}
