// Simple mapping from BE i18n keys -> plain text (Admin does not use i18n)
// Keys come from docs/FE-API-NOTIFICATION-TOUR.md
//
// NOTE:
// - Some messages are templates and expect metadata (e.g. {{tourName}}, {{remainingSlots}}).
// - The rendering layer should replace these placeholders using notification.metadata when needed.

export const TOUR_NOTIFICATION_TEXT: Record<string, string> = {
  // ===== CRUD Tour =====
  'notification.tour_created.title': 'Tour mới đã được tạo',
  'notification.tour_created.message': 'Tour {{tourName}} đã được tạo thành công.',

  'notification.tour_updated.title': 'Tour đã được cập nhật',
  'notification.tour_updated.message': 'Thông tin tour {{tourName}} đã được cập nhật.',

  'notification.tour_deleted.title': 'Tour đã bị xóa',
  'notification.tour_deleted.message':
    'Tour {{tourName}} đã bị xóa khỏi hệ thống. Hãy kiểm tra lại các chiến dịch liên quan.',

  'notification.tour_published.title': 'Tour đã được publish',
  'notification.tour_published.message':
    'Tour {{tourName}} đã được publish và sẵn sàng hiển thị cho khách hàng.',

  'notification.tour_unpublished.title': 'Tour đã bị unpublish',
  'notification.tour_unpublished.message':
    'Tour {{tourName}} đã bị unpublish và sẽ không còn hiển thị cho khách hàng.',

  // ===== Inventory Tour =====
  'notification.tour_inventory_low.title': 'Tồn kho tour sắp hết chỗ',
  'notification.tour_inventory_low.message':
    'Tour {{tourName}} chỉ còn {{remainingSlots}} chỗ trống. Vui lòng kiểm tra và điều chỉnh tồn kho nếu cần.',

  'notification.tour_inventory_sold_out.title': 'Tour đã hết chỗ',
  'notification.tour_inventory_sold_out.message':
    'Tour {{tourName}} đã hết chỗ (sold out). Vui lòng cập nhật tồn kho hoặc tạo thêm lịch khởi hành mới.',

  'notification.tour_inventory_restocked.title': 'Tồn kho tour đã được bổ sung',
  'notification.tour_inventory_restocked.message':
    'Tồn kho tour {{tourName}} đã được bổ sung thêm {{addedSlots}} chỗ. Tour đã sẵn sàng nhận thêm booking.',

  // ===== Booking Tour (Admin) =====
  'notification.tour_booking_created.title': 'Có booking tour mới',
  'notification.tour_booking_created.message':
    'Đã tạo một booking mới cho tour {{tourName}}. Vui lòng kiểm tra và xác nhận.',

  'notification.tour_booking_confirmed.title': 'Booking tour đã được xác nhận',
  'notification.tour_booking_confirmed.message':
    'Booking tour {{tourName}} đã được xác nhận. Hãy chuẩn bị dịch vụ cho khách.',

  'notification.tour_booking_cancelled.title': 'Booking tour đã bị hủy',
  'notification.tour_booking_cancelled.message':
    'Booking tour {{tourName}} đã bị hủy. Vui lòng kiểm tra lại tồn kho và lịch khởi hành.',

  'notification.tour_booking_payment_failed.title': 'Thanh toán booking tour thất bại',
  'notification.tour_booking_payment_failed.message':
    'Thanh toán cho booking tour {{tourName}} đã thất bại. Vui lòng kiểm tra lại với khách hàng hoặc cổng thanh toán.',

  'notification.tour_booking_overbooking.title': 'Cảnh báo overbooking tour',
  'notification.tour_booking_overbooking.message':
    'Hệ thống phát hiện khả năng overbooking cho tour {{tourName}}. Vui lòng kiểm tra tồn kho và điều chỉnh kịp thời.',
};

export const resolveTourNotificationText = (key: string, fallback?: string) =>
  TOUR_NOTIFICATION_TEXT[key] ?? fallback ?? key;

export const formatTourNotification = (
  key: string,
  metadata?: Record<string, unknown>,
  fallback?: string,
) => {
  const template = resolveTourNotificationText(key, fallback);
  if (!metadata) return template;

  return template.replace(/{{\s*([^}]+)\s*}}/g, (match, p1) => {
    const value = metadata[p1];
    if (value === undefined || value === null) return match;
    return String(value);
  });
};

