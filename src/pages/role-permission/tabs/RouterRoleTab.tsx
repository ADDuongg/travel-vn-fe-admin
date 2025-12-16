import {
  Button,
  Card,
  Checkbox,
  Col,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useRoles } from '@/queries/role.queries';
import { useRouters } from '@/queries/router.queries';
import {
  useReplaceRouterRoles,
  useRouterRoles,
} from '@/queries/router-role.queries';

const { Title } = Typography;

export default function RouterRoleTab() {
  const { data: roles = [] } = useRoles();
  const { data: routers = [], isLoading: loadingRouters } = useRouters();

  const [roleCode, setRoleCode] = useState<string>();

  const { data: routerRoles = [], isLoading: loadingRouterRoles } =
    useRouterRoles(roleCode);

  const replaceMutation = useReplaceRouterRoles();

  const checkedRouterCodes = useMemo(
    () => routerRoles.map((r) => r.routerCode),
    [routerRoles],
  );

  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    setChecked(checkedRouterCodes);
  }, [checkedRouterCodes]);

  const onSave = () => {
    if (!roleCode) return;

    replaceMutation.mutate({
      roleCode,
      routerCodes: checked,
    });
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={5}>Router ↔ Role</Title>

        <Select
          style={{ width: 300 }}
          placeholder="Select role"
          value={roleCode}
          onChange={setRoleCode}
          options={roles.map((r) => ({
            label: `${r.name} (${r.code})`,
            value: r.code,
          }))}
        />

        {loadingRouters || loadingRouterRoles ? (
          <Spin />
        ) : (
          <Checkbox.Group
            style={{ width: '100%' }}
            value={checked}
            onChange={(v) => setChecked(v as string[])}
          >
            <Row gutter={[16, 16]}>
              {routers.map((router) => (
                <Col span={8} key={router.code}>
                  <Checkbox value={router.code}>
                    {router.name} ({router.code})
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        )}

        <Button
          type="primary"
          loading={replaceMutation.isPending}
          disabled={!roleCode}
          onClick={onSave}
        >
          Save
        </Button>
      </Space>
    </Card>
  );
}
