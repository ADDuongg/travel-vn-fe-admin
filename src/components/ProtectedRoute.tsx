// ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  rolesAllowed?: string[];
  userRoles?: string[];
  children: React.ReactElement;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  rolesAllowed,
  userRoles,
  children,
  fallbackPath = '/login',
}) => {
  const location = useLocation();

  // Route public khi không cấu hình rolesAllowed
  if (!rolesAllowed || rolesAllowed.length === 0) {
    return children;
  }

  const hasRole =
    Array.isArray(userRoles) &&
    userRoles.some((role) => rolesAllowed.includes(role));

  if (!hasRole) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
