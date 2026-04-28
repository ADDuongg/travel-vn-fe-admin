import type { ReactNode } from 'react';
import { useRbac } from '@/hooks/useRbac';

type IfCanProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

/** Renders children only when `can(permission)` passes (or super admin). */
export function IfCan({ permission, children, fallback = null }: IfCanProps) {
  const { can } = useRbac();
  if (!can(permission)) return <>{fallback}</>;
  return <>{children}</>;
}
