import type { AuthAccount } from '@/interface/auth';

/**
 * Resolve RBAC from account. Align keys with backend `rbac-seed.data.ts`.
 */
export function getRbacState(account: AuthAccount | null | undefined): {
  rbacPermissions: string[];
  isSuperAdmin: boolean;
} {
  const rbacPermissions = account?.rbacPermissions ?? [];
  const isSuperAdmin = account?.isSuperAdmin === true;
  return { rbacPermissions, isSuperAdmin };
}

/**
 * True if user has exact key, or a wildcard grant like `resource.*` covers `resource.action`.
 */
export function can(
  required: string,
  rbac: string[],
  isSuperAdmin?: boolean,
): boolean {
  if (isSuperAdmin === true) return true;
  if (!required) return true;
  for (const granted of rbac) {
    if (granted === required) return true;
    if (granted.endsWith('.*')) {
      const prefix = granted.slice(0, -2);
      if (required === prefix || required.startsWith(`${prefix}.`)) return true;
    }
  }
  return false;
}

export function canFromAccount(
  required: string,
  account: AuthAccount | null | undefined,
): boolean {
  const { rbacPermissions, isSuperAdmin } = getRbacState(account);
  return can(required, rbacPermissions, isSuperAdmin);
}

export function canAllFromAccount(
  required: string[],
  account: AuthAccount | null | undefined,
): boolean {
  if (!required.length) return true;
  return required.every((key) => canFromAccount(key, account));
}
