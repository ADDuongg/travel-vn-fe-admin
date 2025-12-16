import { Card, Space, Table, Tag } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

type Row = { id: string; customer: string; status: 'Paid' | 'Processing' | 'Failed'; total: string; };

export default function OrdersTable() {
  const columns = [
    { title: 'Order #', dataIndex: 'id', key: 'id' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: Row['status']) => {
        const color = s === 'Paid' ? 'green' : s === 'Processing' ? 'blue' : 'volcano';
        return <Tag color={color}>{s}</Tag>;
      },
    },
    { title: 'Total', dataIndex: 'total', key: 'total' },
  ];

  const data: Row[] = [
    { id: 'SO-10231', customer: 'Alice Nguyen', status: 'Paid', total: '$245.90' },
    { id: 'SO-10230', customer: 'John Tran', status: 'Processing', total: '$95.00' },
    { id: 'SO-10229', customer: 'Chris Le', status: 'Failed', total: '$19.99' },
  ];

  return (
    <Card
      style={{ marginTop: 16 }}
      title={
        <Space>
          <BarChartOutlined />
          Recent Orders
        </Space>
      }
    >
      <Table<Row> rowKey="id" columns={columns as any} dataSource={data} pagination={false} />
    </Card>
  );
}
