import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Grid, Pagination, Typography } from 'antd';
import { useAuditLogs } from '@/queries/audit-log.queries';
import type {
  AuditLog,
  AuditLogCategory,
  AuditLogAction,
  AuditLogQueryParams,
  AuditResourceType,
} from '@/interface/audit-log';
import tableStyles from '@/styles/promax-table.module.css';
import AuditLogFilter from './AuditLogFilter';
import AuditLogList from './AuditLogList';
import AuditLogDetailDrawer from './AuditLogDetailDrawer';
import AuditLogExportButton from './AuditLogExportButton';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function AuditLogsPage() {
  const screens = useBreakpoint();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;
  const userId = searchParams.get('userId') || undefined;
  const category = (searchParams.get('category') as AuditLogCategory) || undefined;
  const action = (searchParams.get('action') as AuditLogAction) || undefined;
  const resourceType = (searchParams.get('resourceType') as AuditResourceType) || undefined;
  const ip = searchParams.get('ip') || undefined;
  const fromDate = searchParams.get('fromDate') || undefined;
  const toDate = searchParams.get('toDate') || undefined;

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const queryParams = useMemo<AuditLogQueryParams>(
    () => ({
      page,
      limit,
      userId,
      category,
      action,
      resourceType,
      ip,
      fromDate,
      toDate,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    [page, limit, userId, category, action, resourceType, ip, fromDate, toDate],
  );

  const { data, isLoading } = useAuditLogs(queryParams);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, val]) => {
          if (val === undefined || val === '') {
            next.delete(key);
          } else {
            next.set(key, val);
          }
        });
        return next;
      });
    },
    [setSearchParams],
  );

  const handleFilterChange = useCallback(
    (filters: Record<string, string | undefined>) => {
      updateParams({ ...filters, page: '1' });
    },
    [updateParams],
  );

  const handlePageChange = useCallback(
    (p: number, size: number) => {
      updateParams({ page: String(p), limit: String(size) });
    },
    [updateParams],
  );

  const handleCardClick = useCallback((log: AuditLog) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  }, []);

  const filterParams = useMemo(
    () => ({ userId, category, action, resourceType, ip, fromDate, toDate }),
    [userId, category, action, resourceType, ip, fromDate, toDate],
  );

  const exportParams = useMemo(
    () => ({ userId, category, action, resourceType, ip, fromDate, toDate }),
    [userId, category, action, resourceType, ip, fromDate, toDate],
  );

  return (
    <div className={tableStyles.page} style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card className={tableStyles.mainCard}>
        <div className={tableStyles.header}>
          <div className={tableStyles.titleWrap}>
            <Title level={screens.sm ? 4 : 5} style={{ margin: 0 }}>
              Nhật ký hoạt động
            </Title>
            <Text type="secondary" style={{ fontSize: screens.sm ? 13 : 12 }}>
              Xem lịch sử hoạt động hệ thống: xác thực, dữ liệu, thanh toán.
            </Text>
          </div>
          <div className={tableStyles.toolbar}>
            <AuditLogExportButton params={exportParams} />
          </div>
        </div>

        <AuditLogFilter
          values={filterParams}
          onChange={handleFilterChange}
        />

        <AuditLogList
          data={data?.data}
          isLoading={isLoading}
          onCardClick={handleCardClick}
        />

        {data && data.total > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 16,
            }}
          >
            <Pagination
              current={page}
              pageSize={limit}
              total={data.total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} / ${total} bản ghi`
              }
              size={screens.sm ? 'default' : 'small'}
            />
          </div>
        )}
      </Card>

      <AuditLogDetailDrawer
        log={selectedLog}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
