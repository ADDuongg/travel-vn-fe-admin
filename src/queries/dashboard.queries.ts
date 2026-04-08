import { useQuery } from '@tanstack/react-query';
import {
  getAdminDashboardOverview,
  getAdminDashboardCatalog,
  getAdminDashboardBookings,
  getAdminDashboardRevenue,
  getAdminDashboardUsers,
  type AdminDashboardOverview,
  type CatalogSummary,
  type BookingsSummary,
  type RevenueSummary,
  type UsersSummary,
  type DashboardRange,
} from '@/services/dashboard.service';

export const DASHBOARD_KEYS = {
  overview: (range: DashboardRange, from?: string, to?: string) =>
    ['admin-dashboard-overview', { range, from, to }] as const,
  catalog: ['admin-dashboard-catalog'] as const,
  bookings: (range: DashboardRange, from?: string, to?: string) =>
    ['admin-dashboard-bookings', { range, from, to }] as const,
  revenue: (range: DashboardRange, from?: string, to?: string) =>
    ['admin-dashboard-revenue', { range, from, to }] as const,
  users: (range: DashboardRange, from?: string, to?: string) =>
    ['admin-dashboard-users', { range, from, to }] as const,
};

export const useAdminDashboardOverview = (options?: {
  range?: DashboardRange;
  from?: string;
  to?: string;
}) =>
  useQuery<AdminDashboardOverview>({
    queryKey: DASHBOARD_KEYS.overview(options?.range ?? '7d', options?.from, options?.to),
    queryFn: () =>
      getAdminDashboardOverview({
        range: options?.range,
        from: options?.from,
        to: options?.to,
      }),
  });

export const useAdminDashboardCatalog = () =>
  useQuery<CatalogSummary>({
    queryKey: DASHBOARD_KEYS.catalog,
    queryFn: getAdminDashboardCatalog,
    staleTime: 5 * 60 * 1000,
  });

export const useAdminDashboardBookings = (options?: {
  range?: DashboardRange;
  from?: string;
  to?: string;
}) =>
  useQuery<BookingsSummary>({
    queryKey: DASHBOARD_KEYS.bookings(options?.range ?? '7d', options?.from, options?.to),
    queryFn: () =>
      getAdminDashboardBookings({
        range: options?.range,
        from: options?.from,
        to: options?.to,
      }),
  });

export const useAdminDashboardRevenue = (options?: {
  range?: DashboardRange;
  from?: string;
  to?: string;
}) =>
  useQuery<RevenueSummary>({
    queryKey: DASHBOARD_KEYS.revenue(options?.range ?? '7d', options?.from, options?.to),
    queryFn: () =>
      getAdminDashboardRevenue({
        range: options?.range,
        from: options?.from,
        to: options?.to,
      }),
  });

export const useAdminDashboardUsers = (options?: {
  range?: DashboardRange;
  from?: string;
  to?: string;
}) =>
  useQuery<UsersSummary>({
    queryKey: DASHBOARD_KEYS.users(options?.range ?? '7d', options?.from, options?.to),
    queryFn: () =>
      getAdminDashboardUsers({
        range: options?.range,
        from: options?.from,
        to: options?.to,
      }),
  });
