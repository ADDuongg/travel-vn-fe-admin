import { Empty, Skeleton, theme } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import type { AuditLog } from '@/interface/audit-log';
import AuditLogCard from './AuditLogCard';

interface AuditLogListProps {
  data?: AuditLog[];
  isLoading: boolean;
  onCardClick: (log: AuditLog) => void;
}

export default function AuditLogList({
  data,
  isLoading,
  onCardClick,
}: AuditLogListProps) {
  const { token } = theme.useToken();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: 16,
              borderRadius: token.borderRadiusLG,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Skeleton active paragraph={{ rows: 2 }} title={{ width: '40%' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 0',
        }}
      >
        <Empty
          image={
            <FileTextOutlined
              style={{ fontSize: 48, color: token.colorTextQuaternary }}
            />
          }
          description={
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                Chưa có nhật ký hoạt động nào
              </div>
              <div style={{ color: token.colorTextSecondary, fontSize: 13 }}>
                Các hoạt động của hệ thống sẽ được ghi nhận tại đây.
              </div>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
      {data.map((log) => (
        <AuditLogCard key={log._id} log={log} onClick={onCardClick} />
      ))}
    </div>
  );
}
