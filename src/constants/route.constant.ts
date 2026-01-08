export const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',

  ROOM: {
    INDEX: '/dashboard/room',
    DETAIL: (id: string | number = ':id') => `/dashboard/room/${id}`,
    CREATE: '/dashboard/room/create',
    EDIT: (id: string | number = ':id') => `/dashboard/room/${id}/edit`,
    AMENITIES: '/dashboard/room/amenities',
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
  ROOM: 'ROOM_LIST',
  ROOM_CREATE: 'ROOM_CREATE',
  ROOM_AMENITIES: 'ROOM_AMENITIES',
  ACCOUNT: 'ACCOUNT',
  ROLE_PERMISSION: 'ROLE_PERMISSION',
  SYSTEM: 'SYSTEM',
  ADMIN_REVIEWS: 'ADMIN_REVIEWS',
} as const;
