// routes.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/layout/DashboardLayout';
import Dashboard from '@pages/dashboard/Dashboard';
import Room from '@pages/room/Room';
import Account from '@pages/account/Account';
import { ROUTES } from './constants/route.constant';
import RolePermissionPage from '@pages/role-permission/RolePermissionPage';

export const routes = [
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: <DashboardLayout />,
    handle: { breadcrumb: 'Dashboard' },
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'room',
        element: <Room />,
        handle: { breadcrumb: 'Room List' },
      },
      {
        path: 'room/:id',
        element: <Room />,
        handle: { breadcrumb: 'Room Detail' },
      },
      {
        path: 'account',
        element: <Account />,
        handle: { breadcrumb: 'Account' },
      },
      {
        path: 'role-permission',
        element: <RolePermissionPage />,
        handle: { breadcrumb: 'Role & Permissions' },
      },
    ],
  },
];
