import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { EnumRole } from '@/constants/enum';
import type { AuthAccount } from '@/interface/auth';
import { ROUTES } from '@/constants/route.constant';
import { canAllFromAccount, canFromAccount } from '@/lib/rbac';
import { useAuthStore } from '@/stores/useAuthStore';

interface ProtectedRouteProps {
  /** @deprecated Prefer requiredPermission */
  rolesAllowed?: EnumRole[];
  userRoles?: string[];
  requiredPermission?: string;
  requiredAllPermissions?: string[];
  requiresAuth?: boolean;
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  rolesAllowed,
  userRoles,
  requiredPermission,
  requiredAllPermissions,
  requiresAuth,
  children,
}) => {
  const location = useLocation();
  const status = useAuthStore((s) => s.status);
  const authUser = useAuthStore((s) => s.authUser) as AuthAccount | null;

  if (status === 'checking') {
    return null;
  }

  const needsAuth =
    Boolean(requiresAuth) ||
    Boolean(requiredPermission) ||
    Boolean(requiredAllPermissions && requiredAllPermissions.length > 0) ||
    Boolean(rolesAllowed && rolesAllowed.length > 0);

  if (!needsAuth) {
    return children;
  }

  if (status !== 'authenticated') {
    return (
      <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  if (
    requiredAllPermissions &&
    requiredAllPermissions.length > 0 &&
    !canAllFromAccount(requiredAllPermissions, authUser)
  ) {
    return (
      <Navigate to={ROUTES.FORBIDDEN} state={{ from: location }} replace />
    );
  }

  if (requiredPermission && !canFromAccount(requiredPermission, authUser)) {
    return (
      <Navigate to={ROUTES.FORBIDDEN} state={{ from: location }} replace />
    );
  }

  if (
    rolesAllowed &&
    rolesAllowed.length > 0 &&
    (!Array.isArray(userRoles) ||
      !userRoles.some((role) => rolesAllowed.includes(role as EnumRole)))
  ) {
    return (
      <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  return children;
};

export default ProtectedRoute;
