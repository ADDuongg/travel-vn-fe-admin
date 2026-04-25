// routes.tsx
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/layout/DashboardLayout';
import Dashboard from '@pages/dashboard/Dashboard';
import Account from '@pages/account/Account';
import { ROUTES } from './constants/route.constant';
import RolePermissionPage from '@pages/role-permission/RolePermissionPage';
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
import { EnumRole } from '@/constants/enum';

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
    rolesAllowed: [EnumRole.ADMIN, EnumRole.USER],
    handle: { breadcrumb: 'Dashboard' },
    children: [
      {
        index: true,
        element: <Dashboard />,
      },

      // ===== FAVORITES =====
      {
        path: ROUTES.FAVORITES,
        element: <FavoritesPage />,
        handle: { breadcrumb: 'Favorites' },
      },

      // ===== TOUR =====
      {
        path: ROUTES.TOUR.INDEX,
        element: <TourPage />,
        handle: { breadcrumb: 'Tour' },
      },
      {
        path: ROUTES.TOUR.CREATE,
        element: <TourCreatePage />,
        handle: { breadcrumb: 'Create Tour' },
      },
      {
        path: 'tour/:id/edit',
        element: <TourUpdatePage />,
        handle: { breadcrumb: 'Edit Tour' },
      },
      {
        path: ROUTES.TOUR.INVENTORY,
        element: <TourInventoryPage />,
        handle: { breadcrumb: 'Tour Inventory' },
      },
      {
        path: ROUTES.TOUR_BOOKING.INDEX,
        element: <TourBookingListPage />,
        handle: { breadcrumb: 'Tour Bookings' },
      },
      {
        path: 'tour-bookings/:id',
        element: <TourBookingDetailPage />,
        handle: { breadcrumb: 'Tour Booking Detail' },
      },

      // ===== BLOG =====
      {
        path: ROUTES.BLOG.CATEGORIES_TAGS,
        element: <BlogCategoryTagPage />,
        handle: { breadcrumb: 'Blog categories & tags' },
      },
      {
        path: ROUTES.BLOG.POSTS,
        element: <BlogPostListPage />,
        handle: { breadcrumb: 'Blog posts' },
      },
      {
        path: ROUTES.BLOG.CREATE,
        element: <BlogPostCreatePage />,
        handle: { breadcrumb: 'Create blog post' },
      },
      {
        path: 'blog/posts/:id/edit',
        element: <BlogPostUpdatePage />,
        handle: { breadcrumb: 'Edit blog post' },
      },

      // ===== PROVINCES =====
      {
        path: ROUTES.PROVINCE.INDEX,
        element: <ProvincePage />,
        handle: { breadcrumb: 'Provinces' },
      },

      // ===== TOUR GUIDE =====
      {
        path: ROUTES.TOUR_GUIDE.INDEX,
        element: <TourGuidePage />,
        handle: { breadcrumb: 'Tour Guides' },
      },

      // ===== HOTEL =====
      {
        path: ROUTES.HOTEL.INDEX,
        element: <HotelPage />,
        handle: { breadcrumb: 'Hotel' },
      },
      {
        path: ROUTES.HOTEL.CREATE,
        element: <HotelCreatePage />,
        handle: { breadcrumb: 'Create Hotel' },
      },
      {
        path: 'hotel/:id/edit',
        element: <HotelUpdatePage />,
        handle: { breadcrumb: 'Edit Hotel' },
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
        handle: { breadcrumb: 'System' },
      },
      {
        path: ROUTES.SYSTEM.LANGUAGES,
        element: <SystemLanguagePage />,
        handle: { breadcrumb: 'Languages' },
      },

      // ===== AUDIT LOGS =====
      {
        path: ROUTES.SYSTEM.AUDIT_LOGS,
        element: <AuditLogsPage />,
        handle: { breadcrumb: 'Audit Logs' },
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
