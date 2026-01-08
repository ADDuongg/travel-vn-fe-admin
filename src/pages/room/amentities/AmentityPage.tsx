// pages/amenities/AmenitiesPage.tsx
import { Button, Space, Table, Popconfirm } from 'antd';
import { useState } from 'react';
import {
  useAmenities,
  useCreateAmenity,
  useUpdateAmenity,
  useDeleteAmenity,
} from '@/queries/amenities.queries';
import { AmenityForm } from './AmenityForm';

export default function AmenitiesPage() {
  const { data, isLoading } = useAmenities();

  const createMutation = useCreateAmenity();
  const updateMutation = useUpdateAmenity();
  const deleteMutation = useDeleteAmenity();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Create Amenity
        </Button>
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        dataSource={data}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          {
            title: 'Icon',
            dataIndex: 'icon',
            render: (icon) =>
              icon?.url ? (
                <img
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
            render: (v) => (v ? 'Active' : 'Inactive'),
          },
          {
            title: 'Action',
            render: (_, record) => (
              <Space>
                <Button
                  size="small"
                  onClick={() => {
                    setEditing(record);
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>

                <Popconfirm
                  title="Delete this amenity?"
                  onConfirm={() => deleteMutation.mutate(record._id)}
                >
                  <Button size="small" danger>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <AmenityForm
        open={open}
        initialValues={editing}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setOpen(false)}
        onSubmit={(values) => {
          console.log('values', values);

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
