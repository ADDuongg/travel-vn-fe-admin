// ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  rolesAllowed?: string[];
  userRole?: string;
  children: React.ReactElement;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  rolesAllowed,
  userRole,
  children,
  fallbackPath = '/login',
}) => {
  const location = useLocation();

  if (!rolesAllowed || rolesAllowed.length === 0) {
    return children;
  }

  if (!userRole || !rolesAllowed.includes(userRole)) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
