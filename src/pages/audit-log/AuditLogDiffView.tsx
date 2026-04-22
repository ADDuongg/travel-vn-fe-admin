import { theme, Typography } from 'antd';

const { Text } = Typography;

interface AuditLogDiffViewProps {
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
}

function getAllKeys(
  a: Record<string, unknown> | null,
  b: Record<string, unknown> | null,
): string[] {
  const keys = new Set<string>();
  if (a) Object.keys(a).forEach((k) => keys.add(k));
  if (b) Object.keys(b).forEach((k) => keys.add(k));
  return Array.from(keys).sort();
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '(trống)';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  return String(val);
}

export default function AuditLogDiffView({
  oldValue,
  newValue,
}: AuditLogDiffViewProps) {
  const { token } = theme.useToken();

  if (!oldValue && !newValue) {
    return (
      <Text type="secondary" italic>
        Không có dữ liệu thay đổi
      </Text>
    );
  }

  const keys = getAllKeys(oldValue, newValue);

  const changedKeys = keys.filter((key) => {
    const oldV = oldValue?.[key];
    const newV = newValue?.[key];
    return JSON.stringify(oldV) !== JSON.stringify(newV);
  });

  if (changedKeys.length === 0) {
    return (
      <Text type="secondary" italic>
        Không phát hiện thay đổi
      </Text>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {changedKeys.map((key) => {
        const oldV = oldValue?.[key];
        const newV = newValue?.[key];

        return (
          <div key={key}>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
              {key}:
            </Text>

            {oldV !== undefined && (
              <div
                style={{
                  padding: '6px 10px',
                  borderRadius: token.borderRadius,
                  background: `${token.colorErrorBg}`,
                  color: token.colorError,
                  border: `1px solid ${token.colorErrorBorder}`,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  marginBottom: 4,
                }}
              >
                - {formatValue(oldV)}
              </div>
            )}

            {newV !== undefined && (
              <div
                style={{
                  padding: '6px 10px',
                  borderRadius: token.borderRadius,
                  background: `${token.colorSuccessBg}`,
                  color: token.colorSuccess,
                  border: `1px solid ${token.colorSuccessBorder}`,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                + {formatValue(newV)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
