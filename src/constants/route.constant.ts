export const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',

  TOUR: {
    INDEX: '/dashboard/tour',
    CREATE: '/dashboard/tour/create',
    EDIT: (id: string | number = ':id') => `/dashboard/tour/${id}/edit`,
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
  },
  ADMIN_REVIEWS: '/dashboard/reviews',
} as const;

export const ROUTE_KEYS = {
  DASHBOARD: 'DASHBOARD',
  TOUR: 'TOUR_LIST',
  HOTEL: 'HOTEL_LIST',
  ROOM: 'ROOM_LIST',
  ROOM_CREATE: 'ROOM_CREATE',
  ROOM_AMENITIES: 'ROOM_AMENITIES',
  BOOKING: 'BOOKING_LIST',
  ACCOUNT: 'ACCOUNT',
  ROLE_PERMISSION: 'ROLE_PERMISSION',
  SYSTEM: 'SYSTEM',
  ADMIN_REVIEWS: 'ADMIN_REVIEWS',
} as const;
