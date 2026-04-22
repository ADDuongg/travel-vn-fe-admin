import { Tabs } from 'antd';
import AccountTab from './tabs/AccountTab';
import RouterRoleTab from './tabs/RouterRoleTab';
import ApiRoleTab from './tabs/ApiRoleTab';
import RolesTab from './tabs/RolesTab';
import RouterTab from './tabs/RouterTab';
import ApiTab from './tabs/ApiTab';
import PageShell from '@/components/PageShell';

export default function RolePermissionPage() {
  return (
    <PageShell
      title="Role & Permissions"
      subtitle="Quản lý vai trò, quyền truy cập route và API."
    >
      <Tabs
        items={[
          { key: 'role', label: 'Roles', children: <RolesTab /> },
          { key: 'router-role', label: 'Router Roles', children: <RouterRoleTab /> },
          { key: 'router-api', label: 'API Roles', children: <ApiRoleTab /> },
          { key: 'router', label: 'Routers', children: <RouterTab /> },
          { key: 'api', label: 'APIs', children: <ApiTab /> },
          { key: 'account', label: 'Accounts', children: <AccountTab /> },
        ]}
      />
    </PageShell>
  );
}
