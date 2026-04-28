import { useCallback, useMemo } from 'react';
import { can, getRbacState } from '@/lib/rbac';
import { useAuthStore } from '@/stores/useAuthStore';
import type { AuthAccount } from '@/interface/auth';

export function useRbac() {
  const authUser = useAuthStore((s) => s.authUser) as AuthAccount | null;

  const { rbacPermissions, isSuperAdmin } = useMemo(
    () => getRbacState(authUser),
    [authUser],
  );

  const canFn = useCallback(
    (required: string) => can(required, rbacPermissions, isSuperAdmin),
    [rbacPermissions, isSuperAdmin],
  );

  return {
    can: canFn,
    rbacPermissions,
    isSuperAdmin,
  };
}
