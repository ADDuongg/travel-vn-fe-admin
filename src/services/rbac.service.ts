import api from '@/lib/axios';

export type RbacPermissionCatalogItem = {
  key: string;
  resource: string;
  action: string;
  description?: string;
};

export type ReplaceRolePermissionsResponse = {
  roleId: string;
  roleCode: string;
  previousKeys: string[];
  newKeys: string[];
};

export type ReplaceRolePermissionsBody = {
  permissionKeys: string[];
};

const BASE = '/api/v1/admin/rbac';

export async function getRbacPermissionsCatalog(): Promise<
  RbacPermissionCatalogItem[]
> {
  return api.get<RbacPermissionCatalogItem[]>(
    `${BASE}/permissions`,
  );
}

/** Current permission keys assigned to role (junction). */
export async function getRolePermissionKeys(
  roleId: string,
): Promise<string[]> {
  return api.get<string[]>(`${BASE}/roles/${roleId}/permissions`);
}

export async function replaceRolePermissions(
  roleId: string,
  permissionKeys: string[],
): Promise<ReplaceRolePermissionsResponse> {
  return api.put<ReplaceRolePermissionsResponse>(
    `${BASE}/roles/${roleId}/permissions`,
    { permissionKeys } satisfies ReplaceRolePermissionsBody,
  );
}
