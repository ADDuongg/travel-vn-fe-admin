import type { ReactNode } from 'react';
import { Button, Grid } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;

type FilterBarProps = {
  children: ReactNode;
  onReset?: () => void;
  showReset?: boolean;
};

export default function FilterBar({ children, onReset, showReset = true }: FilterBarProps) {
  const screens = useBreakpoint();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: screens.md ? 10 : 8,
        flexWrap: 'wrap',
        padding: '10px 14px',
        background: 'var(--warm-surface-300)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <FilterOutlined style={{ color: 'var(--text-muted)', fontSize: 13 }} />
      {children}
      {showReset && onReset && (
        <Button
          type="text"
          size="small"
          onClick={onReset}
          style={{
            marginLeft: 'auto',
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
