import api from '@/lib/axios';
import type {
  AuditLog,
  AuditLogListResponse,
  AuditLogQueryParams,
} from '@/interface/audit-log';

/** docs/MODULES-12-15-FE-API.md §4 admin audit-logs */

export const getAuditLogs = (
  params?: AuditLogQueryParams,
): Promise<AuditLogListResponse> =>
  api.get<AuditLogListResponse>('/api/v1/admin/audit-logs', { params });

export const getAuditLogById = (id: string): Promise<AuditLog> =>
  api.get<AuditLog>(`/api/v1/admin/audit-logs/${id}`);

export const exportAuditLogs = async (
  params: Omit<AuditLogQueryParams, 'page' | 'limit'>,
  format: 'csv' | 'xlsx',
): Promise<void> => {
  const res = await api.getRaw<Blob>('/api/v1/admin/audit-logs/export', {
    params: { ...params, format },
    responseType: 'blob',
  });

  const contentDisposition = res.headers['content-disposition'] as
    | string
    | undefined;
  const fallbackName = `audit-logs.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
  const filename =
    contentDisposition?.match(/filename="?(.+?)"?$/)?.[1] ?? fallbackName;

  const url = URL.createObjectURL(res.data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  URL.revokeObjectURL(url);
  anchor.remove();
};
