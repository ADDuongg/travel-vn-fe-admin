import { RBAC } from '@/constants/rbac-keys';
import { useRbacCatalog, useReplaceRolePermissions, useRoleRbacKeys } from '@/queries/rbac.queries';
import { useRoles } from '@/queries/role.queries';
import type { RbacPermissionCatalogItem } from '@/services/rbac.service';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Collapse,
  Empty,
  Flex,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Typography,
  theme,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';

const { Text, Title } = Typography;

function sortKeys(keys: string[]): string[] {
  return [...keys].sort();
}

function keysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = sortKeys(a);
  const sb = sortKeys(b);
  return sa.every((k, i) => k === sb[i]);
}

function groupCatalogByResource(
  items: RbacPermissionCatalogItem[],
): Record<string, RbacPermissionCatalogItem[]> {
  const map: Record<string, RbacPermissionCatalogItem[]> = {};
  for (const row of items) {
    const r = row.resource || 'Other';
    if (!map[r]) map[r] = [];
    map[r].push(row);
  }
  for (const k of Object.keys(map)) {
    map[k].sort((x, y) => x.key.localeCompare(y.key));
  }
  return map;
}

const RbacRolePermissionsPage = () => {
  const { token } = theme.useToken();
  const [roleId, setRoleId] = useState<string | undefined>();
  const [draftKeys, setDraftKeys] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const { data: roles = [], isLoading: loadingRoles } = useRoles();
  const { data: catalog = [], isLoading: loadingCatalog, error: catalogError } =
    useRbacCatalog();
  const {
    data: assignedKeys,
    isLoading: loadingAssigned,
    isFetching: fetchingAssigned,
  } = useRoleRbacKeys(roleId);

  const selectedRole = useMemo(
    () => roles.find((r) => r._id === roleId),
    [roles, roleId],
  );
  const isSuperAdminRole = selectedRole?.code === 'super_admin';

  useEffect(() => {
    setDraftKeys([]);
  }, [roleId]);

  useEffect(() => {
    if (assignedKeys !== undefined && !isSuperAdminRole) {
      setDraftKeys([...assignedKeys]);
    }
  }, [assignedKeys, isSuperAdminRole]);

  const replace = useReplaceRolePermissions();

  const grouped = useMemo(() => groupCatalogByResource(catalog), [catalog]);

  const filteredResources = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return grouped;
    const next: Record<string, RbacPermissionCatalogItem[]> = {};
    for (const [res, rows] of Object.entries(grouped)) {
      const matchRows = rows.filter(
        (row) =>
          row.key.toLowerCase().includes(q) ||
          res.toLowerCase().includes(q) ||
          (row.description ?? '').toLowerCase().includes(q) ||
          row.action.toLowerCase().includes(q),
      );
      if (matchRows.length) next[res] = matchRows;
    }
    return next;
  }, [grouped, search]);

  const resourceKeys = (rows: RbacPermissionCatalogItem[]) =>
    rows.map((r) => r.key);

  const toggleKey = (key: string, checked: boolean) => {
    setDraftKeys((prev) => {
      if (checked) return prev.includes(key) ? prev : [...prev, key];
      return prev.filter((k) => k !== key);
    });
  };

  const setResourceKeys = (rows: RbacPermissionCatalogItem[], selectAll: boolean) => {
    const keys = resourceKeys(rows);
    setDraftKeys((prev) => {
      if (selectAll) {
        const set = new Set([...prev, ...keys]);
        return [...set];
      }
      return prev.filter((k) => !keys.includes(k));
    });
  };

  const baseline = assignedKeys ?? [];
  const dirty =
    Boolean(roleId) &&
    !isSuperAdminRole &&
    !keysEqual(sortKeys(draftKeys), sortKeys(baseline));

  const handleSave = () => {
    if (!roleId || isSuperAdminRole) return;
    replace.mutate(
      { roleId, permissionKeys: sortKeys(draftKeys) },
      {
        onSuccess: () => {
          Modal.info({
            title: 'Permissions updated',
            content:
              'Changes apply after the server refreshes permission caches. Ask affected users to refresh their session (re-login or refresh token) so their JWT includes the new rbacPermissions.',
            okText: 'Understood',
          });
        },
        onError: (err: unknown) => {
          const ax = err as {
            message?: string;
            response?: { data?: { message?: string; unknownKeys?: string[] } };
          };
          const data = ax.response?.data;
          const unknownKeys = data?.unknownKeys;
          const msg =
            data?.message ??
            ax.message ??
            'Failed to update role permissions';
          Modal.error({
            title: 'Could not save',
            content: (
              <div>
                <Text>{msg}</Text>
                {unknownKeys && unknownKeys.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Unknown keys: </Text>
                    <Text code>{unknownKeys.join(', ')}</Text>
                  </div>
                )}
              </div>
            ),
          });
        },
      },
    );
  };

  const loadingMatrix =
    Boolean(roleId) &&
    (loadingAssigned || fetchingAssigned) &&
    !isSuperAdminRole;

  const collapseItems = Object.entries(filteredResources)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([resource, rows]) => {
      const keysInRes = resourceKeys(rows);
      const selectedInRes = keysInRes.filter((k) => draftKeys.includes(k));
      const allSelected =
        keysInRes.length > 0 && selectedInRes.length === keysInRes.length;
      const indeterminate =
        selectedInRes.length > 0 && selectedInRes.length < keysInRes.length;

      return {
        key: resource,
        label: (
          <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
            <Text strong>{resource}</Text>
            <Checkbox
              checked={allSelected}
              indeterminate={indeterminate}
              disabled={isSuperAdminRole}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                setResourceKeys(rows, e.target.checked);
              }}
            >
              Select all in group
            </Checkbox>
          </Flex>
        ),
        children: (
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            {rows.map((row) => (
              <div
                key={row.key}
                style={{
                  padding: '8px 10px',
                  borderRadius: token.borderRadius,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  transition: 'border-color 200ms ease, background 200ms ease',
                }}
              >
                <Checkbox
                  checked={draftKeys.includes(row.key)}
                  disabled={isSuperAdminRole}
                  onChange={(e) => toggleKey(row.key, e.target.checked)}
                >
                  <Text code style={{ fontSize: 13 }}>
                    {row.key}
                  </Text>
                </Checkbox>
                {row.description ? (
                  <div style={{ marginTop: 4, paddingLeft: 24 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {row.description}
                    </Text>
                  </div>
                ) : null}
              </div>
            ))}
          </Space>
        ),
      };
    });

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '8px 0 32px' }}>
      <Title level={4} style={{ marginBottom: 8, letterSpacing: '-0.3px' }}>
        Role permissions
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
        Assign RBAC keys to each role. Requires <Text code>{RBAC.rbac.manage}</Text>{' '}
        on the API.
      </Text>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Role
            </Text>
            <Select
              showSearch
              allowClear
              placeholder="Select a role"
              style={{ width: '100%', maxWidth: 420 }}
              loading={loadingRoles}
              optionFilterProp="label"
              value={roleId}
              onChange={(v) => setRoleId(v)}
              options={roles.map((r) => ({
                value: r._id,
                label: `${r.name} (${r.code})`,
              }))}
            />
          </div>

          {isSuperAdminRole && (
            <Alert
              type="info"
              showIcon
              message="Super admin role"
              description="This role does not use the permission junction. Access is controlled by User.isSuperAdmin. The API returns an empty list and cannot be edited here."
            />
          )}

          {roleId && !isSuperAdminRole && (
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Filter permissions
              </Text>
              <Input.Search
                allowClear
                placeholder="Search by key, resource, description…"
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 420 }}
              />
            </div>
          )}
        </Space>
      </Card>

      {catalogError ? (
        <Alert
          type="error"
          showIcon
          message="Failed to load permission catalog"
        />
      ) : loadingCatalog ? (
        <Flex justify="center" style={{ padding: 48 }}>
          <Spin />
        </Flex>
      ) : catalog.length === 0 ? (
        <Empty description="No permissions in catalog" />
      ) : !roleId ? (
        <Card>
          <Empty description="Select a role to view and edit permissions" />
        </Card>
      ) : isSuperAdminRole ? null : loadingMatrix ? (
        <Flex justify="center" style={{ padding: 48 }}>
          <Spin tip="Loading role permissions…" />
        </Flex>
      ) : (
        <>
          <Flex
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={12}
            style={{ marginBottom: 12 }}
          >
            <Text type="secondary">
              {draftKeys.length} permission{draftKeys.length === 1 ? '' : 's'}{' '}
              selected
            </Text>
            <Button
              type="primary"
              disabled={!dirty || replace.isPending}
              loading={replace.isPending}
              onClick={handleSave}
            >
              Save changes
            </Button>
          </Flex>
          {collapseItems.length === 0 ? (
            <Empty description="No permissions match your search" />
          ) : (
            <Collapse items={collapseItems} defaultActiveKey={Object.keys(filteredResources).slice(0, 3)} />
          )}
        </>
      )}
    </div>
  );
};

export default RbacRolePermissionsPage;
