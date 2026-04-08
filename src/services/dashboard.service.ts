import api from '@/lib/axios';

export type DashboardRange = 'today' | '7d' | '30d' | 'custom';

export type DashboardRangeParams = {
  range?: DashboardRange;
  from?: string;
  to?: string;
};

export type BookingsSummary = {
  today: number;
  thisWeek: number;
  byStatus: Record<string, number>;
};

export type RevenueSummary = {
  today: number;
  thisWeek: number;
  currency: string;
};

export type UsersSummary = {
  total: number;
  newThisWeek: number;
};

export type CatalogSummary = {
  activeHotels: number;
  activeRooms: number;
  activeTours: number;
  totalUsers: number;
};

export type AdminDashboardOverview = {
  bookings: BookingsSummary;
  revenue: RevenueSummary;
  users: UsersSummary;
  catalog: CatalogSummary;
};

export const getAdminDashboardOverview = (params?: DashboardRangeParams) =>
  api.get<AdminDashboardOverview>('/api/v1/admin/dashboard/overview', {
    params: {
      range: params?.range ?? '7d',
      from: params?.from,
      to: params?.to,
    },
  });

export const getAdminDashboardCatalog = () =>
  api.get<CatalogSummary>('/api/v1/admin/dashboard/catalog');

export const getAdminDashboardBookings = (params?: DashboardRangeParams) =>
  api.get<BookingsSummary>('/api/v1/admin/dashboard/bookings', {
    params: {
      range: params?.range ?? '7d',
      from: params?.from,
      to: params?.to,
    },
  });

export const getAdminDashboardRevenue = (params?: DashboardRangeParams) =>
  api.get<RevenueSummary>('/api/v1/admin/dashboard/revenue', {
    params: {
      range: params?.range ?? '7d',
      from: params?.from,
      to: params?.to,
    },
  });

export const getAdminDashboardUsers = (params?: DashboardRangeParams) =>
  api.get<UsersSummary>('/api/v1/admin/dashboard/users', {
    params: {
      range: params?.range ?? '7d',
      from: params?.from,
      to: params?.to,
    },
  });
