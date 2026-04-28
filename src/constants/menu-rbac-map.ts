/**
 * Sidebar menu keys → RBAC permission to show entry. Keys not listed are hidden unless added.
 * `null` means any authenticated user (shell already requires login).
 *
 * Align with backend `rbac-seed.data.ts`.
 */
import { ROUTE_KEYS } from '@/constants/route.constant';
import { RBAC } from '@/constants/rbac-keys';

export const ROUTE_KEY_TO_PERMISSION: Record<string, string | null> = {
  [ROUTE_KEYS.DASHBOARD]: RBAC.dashboard.view,
  [ROUTE_KEYS.FAVORITES]: RBAC.favorite.view,
  [ROUTE_KEYS.TOUR]: RBAC.tour.view,
  [ROUTE_KEYS.TOUR_INVENTORY]: RBAC.inventory.view,
  [ROUTE_KEYS.TOUR_BOOKING]: RBAC.booking.view,
  [ROUTE_KEYS.TOUR_REVIEWS]: RBAC.review.view,
  [ROUTE_KEYS.TOUR_GUIDE]: RBAC.tour_guide.view,
  [ROUTE_KEYS.BLOG_POSTS]: RBAC.blog.view,
  [ROUTE_KEYS.BLOG_CATEGORIES_TAGS]: RBAC.blog.view,
  [ROUTE_KEYS.PROVINCE]: RBAC.province.view,
  [ROUTE_KEYS.HOTEL]: RBAC.hotel.view,
  [ROUTE_KEYS.ROOM]: RBAC.room.view,
  [ROUTE_KEYS.ROOM_AMENITIES]: RBAC.amenity.view,
  [ROUTE_KEYS.BOOKING]: RBAC.booking.view,
  [ROUTE_KEYS.ADMIN_REVIEWS]: RBAC.review.view,
  [ROUTE_KEYS.ACCOUNT]: null,
  [ROUTE_KEYS.SYSTEM]: RBAC.settings.manage,
  [ROUTE_KEYS.ROLES]: RBAC.role.view,
  [ROUTE_KEYS.USERS]: RBAC.user.view,
  [ROUTE_KEYS.AUDIT_LOGS]: RBAC.audit_log.view,
  [ROUTE_KEYS.LANGUAGES]: RBAC.language.view,
};

/** When set, user must have every permission (align with `requiredAllPermissions` on route). */
export const ROUTE_KEY_TO_ALL_PERMISSIONS: Record<string, string[]> = {
  [ROUTE_KEYS.RBAC_PERMISSIONS]: [RBAC.rbac.manage, RBAC.role.view],
};
