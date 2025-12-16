import { Button, Drawer, Form, Select, Space, Switch, Table, Tag } from 'antd';
import { useState } from 'react';
import { useUsers, useUpdateUser } from '@/queries/user.queries';
import { useRoles } from '@/queries/role.queries';
import type { User } from '@/services/user.service';

export default function AccountTab() {
  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const updateUser = useUpdateUser();

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const openDrawer = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue(user);
    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
    setSelectedUser(null);
    form.resetFields();
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    if (!selectedUser) return;

    updateUser.mutate({
      id: selectedUser._id,
      payload: values,
    });

    closeDrawer();
  };

  return (
    <>
      <Table
        loading={isLoading}
        rowKey="_id"
        dataSource={users}
        columns={[
          {
            title: 'Username',
            dataIndex: 'username',
          },
          {
            title: 'Email',
            dataIndex: 'email',
          },
          {
            title: 'Roles',
            dataIndex: 'roles',
            render: (roles: string[]) =>
              roles.map((r) => <Tag key={r}>{r}</Tag>),
          },
          {
            title: 'Active',
            dataIndex: 'isActive',
            render: (v: boolean) => (v ? 'Yes' : 'No'),
          },
          {
            title: 'Action',
            render: (_, record) => (
              <Button type="link" onClick={() => openDrawer(record)}>
                Edit
              </Button>
            ),
          },
        ]}
      />

      <Drawer
        title="Edit User"
        width={420}
        open={open}
        onClose={closeDrawer}
        extra={
          <Space>
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button
              type="primary"
              loading={updateUser.isPending}
              onClick={onSubmit}
            >
              Save
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Email" name="email">
            <Select
              disabled
              options={[]}
              placeholder="Email cannot be changed"
            />
          </Form.Item>

          <Form.Item label="Roles" name="roles">
            <Select
              mode="multiple"
              options={roles.map((r) => ({
                label: r.name,
                value: r.code,
              }))}
            />
          </Form.Item>

          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
