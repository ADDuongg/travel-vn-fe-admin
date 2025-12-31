// routes.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/layout/DashboardLayout';
import Dashboard from '@pages/dashboard/Dashboard';
import Account from '@pages/account/Account';
import { ROUTES } from './constants/route.constant';
import RolePermissionPage from '@pages/role-permission/RolePermissionPage';
import RoomPage from '@pages/room/Room';
import RoomCreatePage from '@pages/room/RoomCreatePage';
import SystemLanguagePage from '@pages/system/SystemLanguagePage';
import SystemPage from '@pages/system/SystemPage';

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

      // ===== ROOM =====
      {
        path: 'room',
        element: <RoomPage />,
        handle: { breadcrumb: 'Room' },
      },
      {
        path: 'room/create',
        element: <RoomCreatePage />,
        handle: { breadcrumb: 'Create Room' },
      },
      /* {
        path: 'room/:id/edit',
        element: <RoomEditPage />,
        handle: { breadcrumb: 'Edit Room' },
      }, */

      // ===== SYSTEM =====
      {
        path: 'system',
        element: <SystemPage />,
        handle: { breadcrumb: 'Quản lý chung' },
      },
      {
        path: 'system/languages',
        element: <SystemLanguagePage />,
        handle: { breadcrumb: 'Ngôn ngữ' },
      },

      // ===== ROLE & PERMISSION =====
      {
        path: 'role-permission',
        element: <RolePermissionPage />,
        handle: { breadcrumb: 'Role & Permissions' },
      },

      // ===== ACCOUNT =====
      {
        path: 'account',
        element: <Account />,
        handle: { breadcrumb: 'Account' },
      },
    ],
  },
];
