export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  FAVORITES: '/dashboard/favorites',

  TOUR: {
    INDEX: '/dashboard/tour',
    CREATE: '/dashboard/tour/create',
    EDIT: (id: string | number = ':id') => `/dashboard/tour/${id}/edit`,
    INVENTORY: '/dashboard/tour/inventory',
    REVIEWS: '/dashboard/reviews?entityType=TOUR',
  },
  TOUR_BOOKING: {
    INDEX: '/dashboard/tour-bookings',
    DETAIL: (id: string | number = ':id') => `/dashboard/tour-bookings/${id}`,
  },
  PROVINCE: {
    INDEX: '/dashboard/provinces',
  },
  TOUR_GUIDE: {
    INDEX: '/dashboard/tour-guides',
  },
  HOTEL: {
    INDEX: '/dashboard/hotel',
    CREATE: '/dashboard/hotel/create',
    EDIT: (id: string | number = ':id') => `/dashboard/hotel/${id}/edit`,
  },
  ROOM: {
    INDEX: '/dashboard/room',
    DETAIL: (id: string | number = ':id') => `/dashboard/room/${id}`,
    CREATE: '/dashboard/room/create',
    EDIT: (id: string | number = ':id') => `/dashboard/room/${id}/edit`,
    AMENITIES: '/dashboard/room/amenities',
  },
  BOOKING: {
    INDEX: '/dashboard/bookings',
  },
  ACCOUNT: '/dashboard/account',

  ROLE_PERMISSION: '/dashboard/role-permission',
  SYSTEM: {
    INDEX: '/dashboard/system',
    LANGUAGES: '/dashboard/system/languages',
    AUDIT_LOGS: '/dashboard/system/audit-logs',
  },
  ADMIN_REVIEWS: '/dashboard/reviews',
} as const;

export const ROUTE_KEYS = {
  DASHBOARD: 'DASHBOARD',
  FAVORITES: 'FAVORITES',
  TOUR: 'TOUR_LIST',
  TOUR_INVENTORY: 'TOUR_INVENTORY',
  TOUR_BOOKING: 'TOUR_BOOKING_LIST',
  PROVINCE: 'PROVINCE_LIST',
  TOUR_GUIDE: 'TOUR_GUIDE_LIST',
  HOTEL: 'HOTEL_LIST',
  ROOM: 'ROOM_LIST',
  ROOM_CREATE: 'ROOM_CREATE',
  ROOM_AMENITIES: 'ROOM_AMENITIES',
  BOOKING: 'BOOKING_LIST',
  ACCOUNT: 'ACCOUNT',
  ROLE_PERMISSION: 'ROLE_PERMISSION',
  SYSTEM: 'SYSTEM',
  AUDIT_LOGS: 'AUDIT_LOGS',
  ADMIN_REVIEWS: 'ADMIN_REVIEWS',
  TOUR_REVIEWS: 'TOUR_REVIEWS',
} as const;
