// bất kỳ component nào cần đọc/đổi theme
import { Radio } from 'antd';
import { useThemeMode } from '@/providers/antd-theme/context';

export function ThemeToggle() {
  const { preference, setPreference, resolvedMode } = useThemeMode();
  return (
    <div style={{ padding: 12 }}>
      <div>Resolved: {resolvedMode}</div>
      <Radio.Group
        value={preference}
        onChange={(e) => setPreference(e.target.value)}
      >
        <Radio.Button value="light">Light</Radio.Button>
        <Radio.Button value="dark">Dark</Radio.Button>
        <Radio.Button value="system">System</Radio.Button>
      </Radio.Group>
    </div>
  );
}
