import React, { useCallback } from 'react';
import { Grid, Tag, theme, Typography } from 'antd';
import {
  SafetyOutlined,
  DatabaseOutlined,
  CreditCardOutlined,
  UserOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import type { AuditLog, AuditLogCategory } from '@/interface/audit-log';
import {
  ACTION_CONFIG,
  CATEGORY_CONFIG,
  RESOURCE_TYPE_LABEL,
} from '@/constants/audit-log.constants';
import styles from './audit-log.module.css';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const CATEGORY_ICON: Record<AuditLogCategory, React.ReactNode> = {
  AUTH: <SafetyOutlined />,
  CRUD: <DatabaseOutlined />,
  PAYMENT: <CreditCardOutlined />,
};

interface AuditLogCardProps {
  log: AuditLog;
  onClick: (log: AuditLog) => void;
}

function AuditLogCard({ log, onClick }: AuditLogCardProps) {
  const { token } = theme.useToken();
  const screens = useBreakpoint();

  const categoryConf = CATEGORY_CONFIG[log.category];
  const actionConf = ACTION_CONFIG[log.action];
  const resourceLabel = log.resourceType
    ? RESOURCE_TYPE_LABEL[log.resourceType]
    : null;

  const handleClick = useCallback(() => onClick(log), [log, onClick]);

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      style={{
        padding: screens.sm ? '14px 18px' : '12px 14px',
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = categoryConf.color;
        e.currentTarget.style.boxShadow = `0 0 0 1px ${categoryConf.color}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = token.colorBorderSecondary;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: token.borderRadiusLG,
            background: `${categoryConf.color}18`,
            color: categoryConf.color,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {CATEGORY_ICON[log.category]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <Text strong style={{ fontSize: 14 }}>
              {actionConf?.label ?? log.action}
            </Text>
            <Tag
              style={{
                borderRadius: 4,
                color: categoryConf.color,
                borderColor: `${categoryConf.color}40`,
                background: `${categoryConf.color}10`,
                fontSize: 11,
                lineHeight: '18px',
              }}
            >
              {categoryConf.label}
            </Tag>
          </div>

          <div style={{ marginTop: 2 }}>
            <Text
              type="secondary"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
              }}
            >
              {log.action}
            </Text>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: screens.sm ? 16 : 10,
              marginTop: 6,
              alignItems: 'center',
            }}
          >
            {log.username && (
              <Text
                type="secondary"
                style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <UserOutlined style={{ fontSize: 12 }} />
                {log.username}
              </Text>
            )}

            {resourceLabel && (
              <Text
                type="secondary"
                style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <FolderOutlined style={{ fontSize: 12 }} />
                {resourceLabel}
              </Text>
            )}

            <Text
              type="secondary"
              style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <ClockCircleOutlined style={{ fontSize: 12 }} />
              {new Date(log.createdAt).toLocaleString('vi-VN')}
            </Text>

            {log.ip && screens.sm && (
              <Text
                type="secondary"
                style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <GlobalOutlined style={{ fontSize: 12 }} />
                {log.ip}
              </Text>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AuditLogCard);
