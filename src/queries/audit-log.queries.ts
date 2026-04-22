import {
  keepPreviousData,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import type {
  AuditLog,
  AuditLogListResponse,
  AuditLogQueryParams,
} from '@/interface/audit-log';
import {
  getAuditLogs,
  getAuditLogById,
  exportAuditLogs,
} from '@/services/audit-log.service';
import { message } from 'antd';

export const AUDIT_LOG_KEYS = {
  all: ['audit-logs'] as const,
  list: (params?: AuditLogQueryParams) => ['audit-logs', params] as const,
  detail: (id: string) => ['audit-logs', 'detail', id] as const,
};

export const useAuditLogs = (params?: AuditLogQueryParams) =>
  useQuery<AuditLogListResponse>({
    queryKey: AUDIT_LOG_KEYS.list(params),
    queryFn: () => getAuditLogs(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export const useAuditLogDetail = (id?: string) =>
  useQuery<AuditLog>({
    queryKey: id ? AUDIT_LOG_KEYS.detail(id) : [],
    queryFn: () => getAuditLogById(id!),
    enabled: !!id,
  });

export const useAuditLogExport = () =>
  useMutation({
    mutationFn: ({
      params,
      format,
    }: {
      params: Omit<AuditLogQueryParams, 'page' | 'limit'>;
      format: 'csv' | 'xlsx';
    }) => exportAuditLogs(params, format),
    onSuccess: () => {
      message.success('Xuất file thành công');
    },
    onError: () => {
      message.error('Xuất file thất bại, vui lòng thử lại');
    },
  });
