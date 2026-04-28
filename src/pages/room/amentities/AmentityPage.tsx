// pages/amenities/AmenitiesPage.tsx
import { Button, Space, Table, Popconfirm, Switch } from 'antd';
import { useState } from 'react';
import {
  useAmenities,
  useCreateAmenity,
  useUpdateAmenity,
  useDeleteAmenity,
} from '@/queries/amenities.queries';
import { AmenityForm } from './AmenityForm';
import { EnumLanguage } from '@/constants/enum';
import { RBAC } from '@/constants/rbac-keys';
import { useRbac } from '@/hooks/useRbac';

export default function AmenitiesPage() {
  const { can } = useRbac();
  const { data, isLoading } = useAmenities();

  const createMutation = useCreateAmenity();
  const updateMutation = useUpdateAmenity();
  const deleteMutation = useDeleteAmenity();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        {can(RBAC.amenity.create) ? (
          <Button
            type="primary"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Create Amenity
          </Button>
        ) : null}
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        dataSource={data}
        columns={[
          {
            title: 'Name',
            dataIndex: 'translations',
            render: (translations) =>
              translations?.[EnumLanguage.DEFAULT].name
                ? translations?.[EnumLanguage.DEFAULT].name
                : '-',
          },
          {
            title: 'Icon',
            dataIndex: 'icon',
            render: (icon) =>
              icon?.url ? (
                <img
                  alt=""
                  src={icon.url}
                  style={{ width: 80, height: 80, objectFit: 'contain' }}
                />
              ) : (
                '-'
              ),
          },

          {
            title: 'Status',
            dataIndex: 'isActive',
            render: (v) => <Switch checked={v} disabled />,
          },
          ...(can(RBAC.amenity.update) || can(RBAC.amenity.delete)
            ? [
                {
                  title: 'Action',
                  render: (_: unknown, record: { _id: string }) => (
                    <Space>
                      {can(RBAC.amenity.update) ? (
                        <Button
                          size="small"
                          onClick={() => {
                            setEditing(record);
                            setOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      ) : null}
                      {can(RBAC.amenity.delete) ? (
                        <Popconfirm
                          title="Delete this amenity?"
                          onConfirm={() => deleteMutation.mutate(record._id)}
                        >
                          <Button size="small" danger>
                            Delete
                          </Button>
                        </Popconfirm>
                      ) : null}
                    </Space>
                  ),
                },
              ]
            : []),
        ]}
      />

      <AmenityForm
        open={open}
        initialValues={editing}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setOpen(false)}
        onSubmit={(values) => {
          if (editing) {
            updateMutation.mutate({
              id: editing._id,
              data: values,
            });
          } else {
            createMutation.mutate(values);
          }
          setOpen(false);
        }}
      />
    </>
  );
}
