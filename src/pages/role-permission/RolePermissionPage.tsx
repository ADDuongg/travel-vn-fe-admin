import { Tabs, Typography } from 'antd';
import AccountTab from './tabs/AccountTab';
import RouterRoleTab from './tabs/RouterRoleTab';
import ApiRoleTab from './tabs/ApiRoleTab';

const { Title } = Typography;

export default function RolePermissionPage() {
  return (
    <div>
      <Title level={4}>Role & Permissions</Title>

      <Tabs
        items={[
          { key: 'role', label: 'ROLE', children: 'Role management' },
          {
            key: 'router-role',
            label: 'ROUTER_ROLE',
            children: <RouterRoleTab />,
          },
          {
            key: 'router-api',
            label: 'ROUTER_API',
            children: <ApiRoleTab />,
          },
          { key: 'router', label: 'ROUTER', children: 'Router management' },
          { key: 'api', label: 'API', children: 'API management' },
          { key: 'account', label: 'ACCOUNT', children: <AccountTab /> },
        ]}
      />
    </div>
  );
}
