// routes.tsx
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/layout/DashboardLayout';
import Dashboard from '@pages/dashboard/Dashboard';
import Account from '@pages/account/Account';
import { ROUTES } from './constants/route.constant';
import HotelPage from '@pages/hotel/Hotel';
import HotelCreatePage from '@pages/hotel/HotelCreatePage';
import HotelUpdatePage from '@pages/hotel/HotelUpdatePage';
import TourPage from '@pages/tour/Tour';
import TourCreatePage from '@pages/tour/TourCreatePage';
import TourUpdatePage from '@pages/tour/TourUpdatePage';
import TourInventoryPage from '@pages/tour/TourInventoryPage';
import TourBookingListPage from '@pages/tour/TourBookingListPage';
import TourBookingDetailPage from '@pages/tour/TourBookingDetailPage';
import RoomPage from '@pages/room/Room';
import RoomCreatePage from '@pages/room/RoomCreatePage';
import SystemLanguagePage from '@pages/system/SystemLanguagePage';
import SystemPage from '@pages/system/SystemPage';
import RbacRolePermissionsPage from '@pages/system/RbacRolePermissionsPage';
import RolesAdminPage from '@pages/system/RolesAdminPage';
import RoomUpdatePage from '@pages/room/RoomUpdatePage';
import AmenitiesPage from '@pages/room/amentities/AmentityPage';
import AdminReviewPage from '@pages/review/ReviewPage';
import BookingPage from '@pages/booking/Booking';
import BookingDetailPage from '@pages/booking/BookingDetail';
import LoginPage from '@pages/auth/LoginPage';
import TourGuidePage from '@pages/tour-guide/TourGuidePage';
import ProvincePage from '@pages/province/ProvincePage';
import FavoritesPage from '@pages/favorites/FavoritesPage';
import AuditLogsPage from '@pages/audit-log/AuditLogsPage';
import BlogCategoryTagPage from '@pages/blog/BlogCategoryTagPage';
import BlogPostListPage from '@pages/blog/BlogPostListPage';
import BlogPostCreatePage from '@pages/blog/BlogPostCreatePage';
import BlogPostUpdatePage from '@pages/blog/BlogPostUpdatePage';
import ForbiddenPage from '@pages/forbidden/ForbiddenPage';
import { RBAC } from '@/constants/rbac-keys';
import UsersAdminPage from '@pages/user/UsersAdminPage';

export const routes = [
  {
    path: ROUTES.ROOT,
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: <DashboardLayout />,
    requiresAuth: true,
    handle: { breadcrumb: 'Dashboard' },
    children: [
      {
        index: true,
        element: <Dashboard />,
        requiredPermission: RBAC.dashboard.view,
      },
      {
        path: 'forbidden',
        element: <ForbiddenPage />,
        requiresAuth: true,
        handle: { breadcrumb: 'Access denied' },
      },

      // ===== FAVORITES =====
      {
        path: ROUTES.FAVORITES,
        element: <FavoritesPage />,
        requiredPermission: RBAC.favorite.view,
        handle: { breadcrumb: 'Favorites' },
      },

      // ===== TOUR =====
      {
        path: ROUTES.TOUR.INDEX,
        element: <TourPage />,
        requiredPermission: RBAC.tour.view,
        handle: { breadcrumb: 'Tour' },
      },
      {
        path: ROUTES.TOUR.CREATE,
        element: <TourCreatePage />,
        requiredPermission: RBAC.tour.create,
        handle: { breadcrumb: 'Create Tour' },
      },
      {
        path: 'tour/:id/edit',
        element: <TourUpdatePage />,
        requiredPermission: RBAC.tour.update,
        handle: { breadcrumb: 'Edit Tour' },
      },
      {
        path: ROUTES.TOUR.INVENTORY,
        element: <TourInventoryPage />,
        requiredPermission: RBAC.inventory.view,
        handle: { breadcrumb: 'Tour Inventory' },
      },
      {
        path: ROUTES.TOUR_BOOKING.INDEX,
        element: <TourBookingListPage />,
        requiredPermission: RBAC.booking.view,
        handle: { breadcrumb: 'Tour Bookings' },
      },
      {
        path: 'tour-bookings/:id',
        element: <TourBookingDetailPage />,
        requiredPermission: RBAC.booking.view,
        handle: { breadcrumb: 'Tour Booking Detail' },
      },

      // ===== BLOG =====
      {
        path: ROUTES.BLOG.CATEGORIES_TAGS,
        element: <BlogCategoryTagPage />,
        requiredPermission: RBAC.blog.view,
        handle: { breadcrumb: 'Blog categories & tags' },
      },
      {
        path: ROUTES.BLOG.POSTS,
        element: <BlogPostListPage />,
        requiredPermission: RBAC.blog.view,
        handle: { breadcrumb: 'Blog posts' },
      },
      {
        path: ROUTES.BLOG.CREATE,
        element: <BlogPostCreatePage />,
        requiredPermission: RBAC.blog.create,
        handle: { breadcrumb: 'Create blog post' },
      },
      {
        path: 'blog/posts/:id/edit',
        element: <BlogPostUpdatePage />,
        requiredPermission: RBAC.blog.update,
        handle: { breadcrumb: 'Edit blog post' },
      },

      // ===== PROVINCES =====
      {
        path: ROUTES.PROVINCE.INDEX,
        element: <ProvincePage />,
        requiredPermission: RBAC.province.view,
        handle: { breadcrumb: 'Provinces' },
      },

      // ===== TOUR GUIDE =====
      {
        path: ROUTES.TOUR_GUIDE.INDEX,
        element: <TourGuidePage />,
        requiredPermission: RBAC.tour_guide.view,
        handle: { breadcrumb: 'Tour Guides' },
      },

      // ===== HOTEL =====
      {
        path: ROUTES.HOTEL.INDEX,
        element: <HotelPage />,
        requiredPermission: RBAC.hotel.view,
        handle: { breadcrumb: 'Hotel' },
      },
      {
        path: ROUTES.HOTEL.CREATE,
        element: <HotelCreatePage />,
        requiredPermission: RBAC.hotel.create,
        handle: { breadcrumb: 'Create Hotel' },
      },
      {
        path: 'hotel/:id/edit',
        element: <HotelUpdatePage />,
        requiredPermission: RBAC.hotel.update,
        handle: { breadcrumb: 'Edit Hotel' },
      },
      // ===== ROOM =====
      {
        path: ROUTES.ROOM.INDEX,
        element: <RoomPage />,
        requiredPermission: RBAC.room.view,
        handle: { breadcrumb: 'Room' },
      },
      {
        path: ROUTES.ROOM.CREATE,
        element: <RoomCreatePage />,
        requiredPermission: RBAC.room.create,
        handle: { breadcrumb: 'Create Room' },
      },
      {
        path: 'room/:id/edit',
        element: <RoomUpdatePage />,
        requiredPermission: RBAC.room.update,
        handle: { breadcrumb: 'Edit Room' },
      },
      {
        path: ROUTES.ROOM.AMENITIES,
        element: <AmenitiesPage />,
        requiredPermission: RBAC.amenity.view,
        handle: { breadcrumb: 'Amenities' },
      },

      // ===== SYSTEM =====
      {
        path: ROUTES.SYSTEM.INDEX,
        element: <SystemPage />,
        requiredPermission: RBAC.settings.manage,
        handle: { breadcrumb: 'System' },
      },
      {
        path: ROUTES.SYSTEM.LANGUAGES,
        element: <SystemLanguagePage />,
        requiredPermission: RBAC.language.view,
        handle: { breadcrumb: 'Languages' },
      },
      {
        path: ROUTES.SYSTEM.ROLES,
        element: <RolesAdminPage />,
        requiredPermission: RBAC.role.view,
        handle: { breadcrumb: 'Roles' },
      },
      {
        path: ROUTES.SYSTEM.USERS,
        element: <UsersAdminPage />,
        requiredPermission: RBAC.user.view,
        handle: { breadcrumb: 'Users' },
      },
      {
        path: ROUTES.SYSTEM.RBAC,
        element: <RbacRolePermissionsPage />,
        requiredAllPermissions: [RBAC.rbac.manage, RBAC.role.view],
        handle: { breadcrumb: 'Role permissions' },
      },

      // ===== AUDIT LOGS =====
      {
        path: ROUTES.SYSTEM.AUDIT_LOGS,
        element: <AuditLogsPage />,
        requiredPermission: RBAC.audit_log.view,
        handle: { breadcrumb: 'Audit Logs' },
      },

      // ===== ACCOUNT =====
      {
        path: ROUTES.ACCOUNT,
        element: <Account />,
        requiresAuth: true,
        handle: { breadcrumb: 'Account' },
      },

      // ===== ADMIN REVIEWS =====
      {
        path: 'reviews',
        element: <AdminReviewPage />,
        requiredPermission: RBAC.review.view,
        handle: { breadcrumb: 'Reviews' },
      },

      // ===== BOOKINGS =====
      {
        path: 'bookings',
        element: <BookingPage />,
        requiredPermission: RBAC.booking.view,
        handle: { breadcrumb: 'Bookings' },
      },
      {
        path: 'bookings/:id',
        element: <BookingDetailPage />,
        requiredPermission: RBAC.booking.view,
        handle: { breadcrumb: 'Booking Detail' },
      },
    ],
  },
];
