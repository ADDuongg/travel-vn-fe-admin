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

localStorage.setItem('userRole', 'admin');

const useUserRole = (): EnumRole | undefined =>
  localStorage.getItem('userRole') as EnumRole | undefined;

const wrap = (
  element: React.ReactElement,
  rolesAllowed: EnumRole[] | undefined,
  userRole: EnumRole | undefined,
) => (
  <ProtectedRoute rolesAllowed={rolesAllowed} userRole={userRole}>
    {element}
  </ProtectedRoute>
);

const transformRoutes = (
  configs: RouteConfig[],
  userRole: EnumRole | undefined,
): RouteObject[] => {
  return configs.map<RouteObject>((cfg) => {
    const { index, path, element, rolesAllowed, children, handle } = cfg;

    if (index) {
      const node: IndexRouteObject = {
        index: true,
        element: wrap(element, rolesAllowed, userRole),
        handle,
      };
      return node;
    }

    // NonIndexRouteObject: has path, may have children
    const node: NonIndexRouteObject = {
      path, // do not leave undefined for non-index route
      element: wrap(element, rolesAllowed, userRole),
      handle,
      children: children ? transformRoutes(children, userRole) : undefined,
    };
    return node;
  });
};

const AppRouter = () => {
  const userRole = useUserRole();

  const routeObjects = React.useMemo(
    () => transformRoutes(routes, userRole),
    [userRole],
  );

  const router = React.useMemo(
    () => createBrowserRouter(routeObjects),
    [routeObjects],
  );

  return <RouterProvider router={router} />;
};

export default AppRouter;
