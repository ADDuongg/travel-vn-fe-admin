export const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',

  ROOM: {
    LIST: '/dashboard/room',
    DETAIL: (id: string | number = ':id') => `/dashboard/room/${id}`,
  },

  ACCOUNT: '/dashboard/account',

  ROLE_PERMISSION: '/dashboard/role-permission',
} as const;

export const ROUTE_KEYS = {
  DASHBOARD: 'DASHBOARD',
  ROOM: 'ROOM_LIST',
  ACCOUNT: 'ACCOUNT',
  ROLE_PERMISSION: 'ROLE_PERMISSION',
} as const;
