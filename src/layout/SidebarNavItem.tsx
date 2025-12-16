import {  useState, type ReactNode } from 'react';
import { theme, Typography } from 'antd';

const { Text } = Typography;

export default function SidebarNavItem({
  icon,
  label,
  collapsed,
  level = 1,
  active = false,
  children,
}: {
  icon: ReactNode;
  label: string;
  collapsed: boolean;
  level?: 1 | 2;
  active?: boolean;
  children?: ReactNode;
}) {
  const { token } = theme.useToken();
  const [hovered, setHovered] = useState(false);

  const paddingLeft = collapsed ? 8 : level === 1 ? 12 : 28;

  return (
    <div>
      <div
        className="nav-item"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          height: 36,
          paddingInline: 8,
          paddingLeft,
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'background 120ms ease, color 120ms ease',
          background: active
            ? token.colorPrimaryBg
            : hovered
            ? token.colorFillTertiary
            : 'transparent',
          color: active ? token.colorPrimary : token.colorText,
        }}
      >
        {icon && <span style={{ fontSize: 16, lineHeight: 0 }}>{icon}</span>}
        {!collapsed && (
          <Text
            style={{
              marginTop: 1,
              fontWeight: active ? 600 : 500,
              color: active ? token.colorPrimary : token.colorText,
            }}
            ellipsis
          >
            {label}
          </Text>
        )}
      </div>
      {children && !collapsed && (
        <div style={{ marginTop: 4, marginBottom: 4 }}>{children}</div>
      )}
    </div>
  );
}
