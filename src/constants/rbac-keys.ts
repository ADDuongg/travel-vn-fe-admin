/**
 * Align permission strings with backend `rbac-seed.data.ts` / `@RequirePermissions`.
 * If a key mismatches the seed, guards and menu will behave incorrectly.
 */

export const RBAC = {
  dashboard: { view: 'dashboard.view' },
  favorite: { view: 'favorite.view' },
  tour: {
    view: 'tour.view',
    create: 'tour.create',
    update: 'tour.update',
    delete: 'tour.delete',
  },
  inventory: { view: 'inventory.view', manage: 'inventory.manage' },
  booking: {
    view: 'booking.view',
    update: 'booking.update',
    cancel: 'booking.cancel',
    refund: 'booking.refund',
  },
  payment: { view: 'payment.view', refund: 'payment.refund' },
  blog: {
    view: 'blog.view',
    create: 'blog.create',
    update: 'blog.update',
    publish: 'blog.publish',
    delete: 'blog.delete',
  },
  hotel: {
    view: 'hotel.view',
    create: 'hotel.create',
    update: 'hotel.update',
    delete: 'hotel.delete',
  },
  room: {
    view: 'room.view',
    create: 'room.create',
    update: 'room.update',
    delete: 'room.delete',
  },
  amenity: {
    view: 'amenity.view',
    create: 'amenity.create',
    update: 'amenity.update',
    delete: 'amenity.delete',
  },
  province: { view: 'province.view', update: 'province.update' },
  language: { view: 'language.view', update: 'language.update' },
  tour_guide: {
    view: 'tour_guide.view',
    create: 'tour_guide.create',
    update: 'tour_guide.update',
    delete: 'tour_guide.delete',
  },
  review: { view: 'review.view', update: 'review.update' },
  audit_log: { view: 'audit_log.view' },
  settings: { manage: 'settings.manage' },
  media: { upload: 'media.upload', delete: 'media.delete' },
  user: {
    view: 'user.view',
    create: 'user.create',
    update: 'user.update',
    delete: 'user.delete',
  },
  rbac: { manage: 'rbac.manage' },
  /** Catalog roles (GET /api/v1/admin/roles). */
  role: { view: 'role.view' },
} as const;
