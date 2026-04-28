// AppRouter.tsx
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
  type IndexRouteObject,
  type NonIndexRouteObject,
} from 'react-router-dom';
import { routes } from './router';
import ProtectedRoute from './components/ProtectedRoute';
import type { EnumRole } from './constants/enum';
import type { RouteConfig } from '@interface/commons';
import { useInitAuth } from '@/hooks/useInitAuth';
import { useAuthStore } from '@/stores/useAuthStore';

const useUserRoles = (): string[] | undefined => {
  const authUser = useAuthStore((s) => s.authUser as { roles?: string[] });
  if (!Array.isArray(authUser?.roles)) return undefined;
  return authUser.roles.map((r: string) => r.toLowerCase());
};

const wrap = (
  element: React.ReactElement,
  opts: Pick<
    RouteConfig,
    'rolesAllowed' | 'requiredPermission' | 'requiredAllPermissions' | 'requiresAuth'
  >,
  userRoles: string[] | undefined,
) => (
  <ProtectedRoute
    rolesAllowed={opts.rolesAllowed as EnumRole[] | undefined}
    userRoles={userRoles}
    requiredPermission={opts.requiredPermission}
    requiredAllPermissions={opts.requiredAllPermissions}
    requiresAuth={opts.requiresAuth}
  >
    {element}
  </ProtectedRoute>
);

const transformRoutes = (
  configs: RouteConfig[],
  userRoles: string[] | undefined,
): RouteObject[] => {
  return configs.map<RouteObject>((cfg) => {
    const {
      index,
      path,
      element,
      rolesAllowed,
      requiredPermission,
      requiredAllPermissions,
      requiresAuth,
      children,
      handle,
    } = cfg;
    const routeOpts = {
      rolesAllowed,
      requiredPermission,
      requiredAllPermissions,
      requiresAuth,
    };

    if (index) {
      const node: IndexRouteObject = {
        index: true,
        element: wrap(element, routeOpts, userRoles),
        handle,
      };
      return node;
    }

    const node: NonIndexRouteObject = {
      path,
      element: wrap(element, routeOpts, userRoles),
      handle,
      children: children ? transformRoutes(children, userRoles) : undefined,
    };
    return node;
  });
};

const AppRouter = () => {
  useInitAuth();
  const userRoles = useUserRoles();

  const routeObjects = React.useMemo(
    () => transformRoutes(routes, userRoles),
    [userRoles],
  );

  const router = React.useMemo(
    () => createBrowserRouter(routeObjects),
    [routeObjects],
  );

  return <RouterProvider router={router} />;
};

export default AppRouter;
