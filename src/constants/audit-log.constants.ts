import type {
  AuditLogCategory,
  AuditLogAction,
  AuditResourceType,
} from '@/interface/audit-log';

export interface ActionConfig {
  label: string;
  icon: string;
  color: string;
}

export const CATEGORY_CONFIG: Record<
  AuditLogCategory,
  { label: string; icon: string; color: string }
> = {
  AUTH: { label: 'Xác thực', icon: 'SafetyOutlined', color: '#1f8a65' },
  CRUD: { label: 'Dữ liệu', icon: 'DatabaseOutlined', color: '#9fbbe0' },
  PAYMENT: { label: 'Thanh toán', icon: 'CreditCardOutlined', color: '#c0a8dd' },
};

export const ACTION_CONFIG: Record<AuditLogAction, ActionConfig> = {
  USER_LOGIN: { label: 'Đăng nhập', icon: 'LoginOutlined', color: '#1f8a65' },
  USER_LOGIN_FAILED: { label: 'Đăng nhập thất bại', icon: 'LoginOutlined', color: '#cf2d56' },
  USER_REGISTER: { label: 'Đăng ký tài khoản', icon: 'UserAddOutlined', color: '#1f8a65' },
  USER_LOGOUT: { label: 'Đăng xuất', icon: 'LogoutOutlined', color: '#9fc9a2' },
  USER_LOGOUT_ALL: { label: 'Đăng xuất tất cả thiết bị', icon: 'LogoutOutlined', color: '#f54e00' },
  PASSWORD_RESET_REQUEST: { label: 'Yêu cầu đặt lại mật khẩu', icon: 'KeyOutlined', color: '#c08532' },
  PASSWORD_RESET_CONFIRM: { label: 'Xác nhận đặt lại mật khẩu', icon: 'KeyOutlined', color: '#1f8a65' },
  TOKEN_REFRESH: {
    label: 'Làm mới token (đã ngưng ghi nhật ký)',
    icon: 'SyncOutlined',
    color: '#e1e0db',
  },
  TOKEN_REUSE_DETECTED: { label: 'Phát hiện tái sử dụng token', icon: 'WarningOutlined', color: '#cf2d56' },

  RESOURCE_CREATED: { label: 'Tạo mới', icon: 'PlusOutlined', color: '#1f8a65' },
  RESOURCE_UPDATED: { label: 'Cập nhật', icon: 'EditOutlined', color: '#9fbbe0' },
  RESOURCE_DELETED: { label: 'Xóa', icon: 'DeleteOutlined', color: '#cf2d56' },
  RESOURCE_SOFT_DELETED: { label: 'Xóa mềm', icon: 'InboxOutlined', color: '#f54e00' },
  RESOURCE_RESTORED: { label: 'Khôi phục', icon: 'UndoOutlined', color: '#1f8a65' },

  PAYMENT_INTENT_CREATED: { label: 'Tạo yêu cầu thanh toán', icon: 'CreditCardOutlined', color: '#9fbbe0' },
  PAYMENT_SUCCEEDED: { label: 'Thanh toán thành công', icon: 'CheckCircleOutlined', color: '#1f8a65' },
  PAYMENT_FAILED: { label: 'Thanh toán thất bại', icon: 'CloseCircleOutlined', color: '#cf2d56' },
  PAYMENT_REFUNDED: { label: 'Hoàn tiền', icon: 'RollbackOutlined', color: '#f54e00' },
  PAYMENT_EXPIRED: { label: 'Hết hạn thanh toán', icon: 'ClockCircleOutlined', color: '#dfa88f' },
  PAYMENT_CANCELLED: { label: 'Hủy thanh toán', icon: 'CloseOutlined', color: '#cf2d56' },
};

export const CATEGORY_OPTIONS: { label: string; value: AuditLogCategory }[] = [
  { label: 'Xác thực', value: 'AUTH' },
  { label: 'Dữ liệu', value: 'CRUD' },
  { label: 'Thanh toán', value: 'PAYMENT' },
];

export const AUTH_ACTIONS: AuditLogAction[] = [
  'USER_LOGIN',
  'USER_LOGIN_FAILED',
  'USER_REGISTER',
  'USER_LOGOUT',
  'USER_LOGOUT_ALL',
  'PASSWORD_RESET_REQUEST',
  'PASSWORD_RESET_CONFIRM',
  'TOKEN_REUSE_DETECTED',
];

export const CRUD_ACTIONS: AuditLogAction[] = [
  'RESOURCE_CREATED',
  'RESOURCE_UPDATED',
  'RESOURCE_DELETED',
  'RESOURCE_SOFT_DELETED',
  'RESOURCE_RESTORED',
];

export const PAYMENT_ACTIONS: AuditLogAction[] = [
  'PAYMENT_INTENT_CREATED',
  'PAYMENT_SUCCEEDED',
  'PAYMENT_FAILED',
  'PAYMENT_REFUNDED',
  'PAYMENT_EXPIRED',
  'PAYMENT_CANCELLED',
];

export const ACTION_BY_CATEGORY: Record<AuditLogCategory, AuditLogAction[]> = {
  AUTH: AUTH_ACTIONS,
  CRUD: CRUD_ACTIONS,
  PAYMENT: PAYMENT_ACTIONS,
};

export const RESOURCE_TYPE_OPTIONS: { label: string; value: AuditResourceType }[] = [
  { label: 'Người dùng', value: 'USER' },
  { label: 'Tour', value: 'TOUR' },
  { label: 'Khách sạn', value: 'HOTEL' },
  { label: 'Phòng', value: 'ROOM' },
  { label: 'Đặt phòng', value: 'BOOKING' },
  { label: 'Đặt tour', value: 'TOUR_BOOKING' },
  { label: 'Đánh giá', value: 'REVIEW' },
  { label: 'Hướng dẫn viên', value: 'TOUR_GUIDE' },
  { label: 'Thanh toán', value: 'PAYMENT' },
  { label: 'Phiên đăng nhập', value: 'AUTH_SESSION' },
];

export const RESOURCE_TYPE_LABEL: Record<AuditResourceType, string> = {
  USER: 'Người dùng',
  TOUR: 'Tour',
  HOTEL: 'Khách sạn',
  ROOM: 'Phòng',
  BOOKING: 'Đặt phòng',
  TOUR_BOOKING: 'Đặt tour',
  REVIEW: 'Đánh giá',
  TOUR_GUIDE: 'Hướng dẫn viên',
  PAYMENT: 'Thanh toán',
  AUTH_SESSION: 'Phiên đăng nhập',
};
