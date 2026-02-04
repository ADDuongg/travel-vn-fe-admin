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
import { useEffect, useState } from 'react';
import { useRoles } from '@/queries/role.queries';
import { useApiPermissions } from '@/queries/api-permission.queries';
import { useApiRoles, useReplaceApiRoles } from '@/queries/api-role.queries';

const { Title, Text } = Typography;

export default function ApiRoleTab() {
  const { data: roles = [] } = useRoles();
  const { data: apiPermissions = [], isLoading: loadingApis } =
    useApiPermissions();

  const [roleCode, setRoleCode] = useState<string>();

  const { data: apiRoles = [], isLoading: loadingApiRoles } =
    useApiRoles(roleCode);

  const replaceMutation = useReplaceApiRoles();

  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    if (apiRoles) {
      setChecked(apiRoles.map((r) => r.apiCode));
    }
  }, [roleCode]);

  const onSave = () => {
    if (!roleCode) return;

    replaceMutation.mutate({
      roleCode,
      apiCodes: checked,
    });
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={5}>API ↔ Role</Title>

        {/* Select role */}
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

        {/* Checkbox list */}
        {loadingApis || loadingApiRoles ? (
          <Spin />
        ) : (
          <Checkbox.Group
            style={{ width: '100%' }}
            value={checked}
            onChange={(v) => setChecked(v as string[])}
          >
            <Row gutter={[16, 16]}>
              {apiPermissions.map((api) => (
                <Col span={12} key={api.code}>
                  <Checkbox value={api.code}>
                    <Space direction="vertical" size={0}>
                      <Text strong>
                        {api.name} ({api.code})
                      </Text>
                      <Text type="secondary">
                        {api.method} {api.path}
                      </Text>
                    </Space>
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        )}

        {/* Save */}
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
