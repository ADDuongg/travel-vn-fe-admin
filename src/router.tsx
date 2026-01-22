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
import RoomUpdatePage from '@pages/room/RoomUpdatePage';
import AmenitiesPage from '@pages/room/amentities/AmentityPage';
import AdminReviewPage from '@pages/review/ReviewPage';
import BookingPage from '@pages/booking/Booking';
import BookingDetailPage from '@pages/booking/BookingDetail';

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
        path: ROUTES.ROOM.INDEX,
        element: <RoomPage />,
        handle: { breadcrumb: 'Room' },
      },
      {
        path: ROUTES.ROOM.CREATE,
        element: <RoomCreatePage />,
        handle: { breadcrumb: 'Create Room' },
      },
      {
        path: 'room/:id/edit',
        element: <RoomUpdatePage />,
        handle: { breadcrumb: 'Edit Room' },
      },
      {
        path: ROUTES.ROOM.AMENITIES,
        element: <AmenitiesPage />,
        handle: { breadcrumb: 'Amenities' },
      },

      // ===== SYSTEM =====
      {
        path: ROUTES.SYSTEM.INDEX,
        element: <SystemPage />,
        handle: { breadcrumb: 'Quản lý chung' },
      },
      {
        path: ROUTES.SYSTEM.LANGUAGES,
        element: <SystemLanguagePage />,
        handle: { breadcrumb: 'Ngôn ngữ' },
      },

      // ===== ROLE & PERMISSION =====
      {
        path: ROUTES.ROLE_PERMISSION,
        element: <RolePermissionPage />,
        handle: { breadcrumb: 'Role & Permissions' },
      },

      // ===== ACCOUNT =====
      {
        path: ROUTES.ACCOUNT,
        element: <Account />,
        handle: { breadcrumb: 'Account' },
      },

      // ===== ADMIN REVIEWS =====
      {
        path: 'reviews',
        element: <AdminReviewPage />,
        handle: { breadcrumb: 'Reviews' },
      },

      // ===== BOOKINGS =====
      {
        path: 'bookings',
        element: <BookingPage />,
        handle: { breadcrumb: 'Bookings' },
      },
      {
        path: 'bookings/:id',
        element: <BookingDetailPage />,
        handle: { breadcrumb: 'Booking Detail' },
      },
    ],
  },
];
