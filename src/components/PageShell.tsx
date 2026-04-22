import type { ReactNode } from 'react';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;

type PageShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  const screens = useBreakpoint();

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: screens.md ? '0' : '0',
      }}
    >
      <div className="premium-page-header">
        <div>
          <h3
            style={{
              fontSize: screens.sm ? 24 : 20,
              fontWeight: 600,
              letterSpacing: '-0.5px',
              lineHeight: 1.25,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {title}
          </h3>
          {subtitle && <p className="premium-page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}
