import { Descriptions, Divider, Drawer, Grid, Tag, theme, Typography } from 'antd';
import {
  SafetyOutlined,
  DatabaseOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import type { AuditLog, AuditLogCategory } from '@/interface/audit-log';
import {
  ACTION_CONFIG,
  CATEGORY_CONFIG,
  RESOURCE_TYPE_LABEL,
} from '@/constants/audit-log.constants';
import AuditLogDiffView from './AuditLogDiffView';

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const CATEGORY_ICON: Record<AuditLogCategory, React.ReactNode> = {
  AUTH: <SafetyOutlined />,
  CRUD: <DatabaseOutlined />,
  PAYMENT: <CreditCardOutlined />,
};

interface AuditLogDetailDrawerProps {
  log: AuditLog | null;
  open: boolean;
  onClose: () => void;
}

export default function AuditLogDetailDrawer({
  log,
  open,
  onClose,
}: AuditLogDetailDrawerProps) {
  const screens = useBreakpoint();
  const { token } = theme.useToken();

  if (!log) return null;

  const categoryConf = CATEGORY_CONFIG[log.category];
  const actionConf = ACTION_CONFIG[log.action];
  const hasChanges =
    log.action === 'RESOURCE_UPDATED' && (log.oldValue || log.newValue);

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: token.borderRadiusLG,
              background: `${categoryConf.color}18`,
              color: categoryConf.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            {CATEGORY_ICON[log.category]}
          </div>
          <div>
            <Title level={5} style={{ margin: 0, lineHeight: 1.3 }}>
              Chi tiết nhật ký
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {actionConf?.label}
            </Text>
          </div>
        </div>
      }
      open={open}
      onClose={onClose}
      placement="right"
      width={screens.md ? 520 : '100%'}
      destroyOnClose
    >
      <Descriptions
        column={1}
        size="small"
        labelStyle={{ fontWeight: 500, width: 130, fontSize: 13 }}
        contentStyle={{ fontSize: 13 }}
      >
        <Descriptions.Item label="Loại sự kiện">
          <Tag
            style={{
              color: categoryConf.color,
              borderColor: `${categoryConf.color}40`,
              background: `${categoryConf.color}10`,
            }}
          >
            {categoryConf.label}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Hành động">
          <div>
            <div>{actionConf?.label ?? log.action}</div>
            <Text
              type="secondary"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
            >
              {log.action}
            </Text>
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Người dùng">
          {log.username ?? '—'}
        </Descriptions.Item>

        <Descriptions.Item label="Địa chỉ IP">
          {log.ip ? (
            <Text copyable style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {log.ip}
            </Text>
          ) : (
            '—'
          )}
        </Descriptions.Item>

        <Descriptions.Item label="User Agent">
          <Text
            type="secondary"
            ellipsis={{ tooltip: log.userAgent }}
            style={{ maxWidth: 300, fontSize: 12 }}
          >
            {log.userAgent ?? '—'}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="Loại tài nguyên">
          {log.resourceType
            ? RESOURCE_TYPE_LABEL[log.resourceType]
            : '—'}
        </Descriptions.Item>

        <Descriptions.Item label="Resource ID">
          {log.resourceId ? (
            <Text copyable style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {log.resourceId}
            </Text>
          ) : (
            '—'
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Thời gian">
          {new Date(log.createdAt).toLocaleString('vi-VN')}
        </Descriptions.Item>

        {log.description && (
          <Descriptions.Item label="Mô tả">
            {log.description}
          </Descriptions.Item>
        )}
      </Descriptions>

      {hasChanges && (
        <>
          <Divider style={{ margin: '16px 0' }} />
          <Title level={5} style={{ marginBottom: 12 }}>
            Thay đổi
          </Title>
          <AuditLogDiffView oldValue={log.oldValue} newValue={log.newValue} />
        </>
      )}

      {!hasChanges && (log.oldValue || log.newValue) && (
        <>
          <Divider style={{ margin: '16px 0' }} />
          {log.oldValue && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5} style={{ marginBottom: 8 }}>
                Giá trị cũ
              </Title>
              <pre
                style={{
                  background: token.colorBgLayout,
                  padding: 12,
                  borderRadius: token.borderRadius,
                  fontSize: 12,
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                {JSON.stringify(log.oldValue, null, 2)}
              </pre>
            </div>
          )}
          {log.newValue && (
            <div>
              <Title level={5} style={{ marginBottom: 8 }}>
                Giá trị mới
              </Title>
              <pre
                style={{
                  background: token.colorBgLayout,
                  padding: 12,
                  borderRadius: token.borderRadius,
                  fontSize: 12,
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                {JSON.stringify(log.newValue, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}

      {log.metadata && (
        <>
          <Divider style={{ margin: '16px 0' }} />
          <Title level={5} style={{ marginBottom: 8 }}>
            Metadata
          </Title>
          <pre
            style={{
              background: token.colorBgLayout,
              padding: 12,
              borderRadius: token.borderRadius,
              fontSize: 12,
              overflow: 'auto',
              maxHeight: 200,
            }}
          >
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </>
      )}
    </Drawer>
  );
}
