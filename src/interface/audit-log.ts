export type AuditLogCategory = 'AUTH' | 'CRUD' | 'PAYMENT';

/** `TOKEN_REFRESH` là reserved: BE không ghi audit khi refresh thành công (tránh nhiễu). */
export type AuditAuthAction =
  | 'USER_LOGIN'
  | 'USER_LOGIN_FAILED'
  | 'USER_REGISTER'
  | 'USER_LOGOUT'
  | 'USER_LOGOUT_ALL'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_CONFIRM'
  | 'TOKEN_REFRESH'
  | 'TOKEN_REUSE_DETECTED';

export type AuditCrudAction =
  | 'RESOURCE_CREATED'
  | 'RESOURCE_UPDATED'
  | 'RESOURCE_DELETED'
  | 'RESOURCE_SOFT_DELETED'
  | 'RESOURCE_RESTORED';

export type AuditPaymentAction =
  | 'PAYMENT_INTENT_CREATED'
  | 'PAYMENT_SUCCEEDED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_EXPIRED'
  | 'PAYMENT_CANCELLED';

export type AuditLogAction =
  | AuditAuthAction
  | AuditCrudAction
  | AuditPaymentAction;

export type AuditResourceType =
  | 'USER'
  | 'TOUR'
  | 'HOTEL'
  | 'ROOM'
  | 'BOOKING'
  | 'TOUR_BOOKING'
  | 'REVIEW'
  | 'TOUR_GUIDE'
  | 'PAYMENT'
  | 'AUTH_SESSION';

export interface AuditLog {
  _id: string;
  category: AuditLogCategory;
  action: AuditLogAction;
  resourceType: AuditResourceType;
  resourceId: string | null;
  userId: string | null;
  username: string | null;
  ip: string | null;
  userAgent: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogQueryParams {
  userId?: string;
  category?: AuditLogCategory;
  action?: AuditLogAction;
  resourceType?: AuditResourceType;
  ip?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
