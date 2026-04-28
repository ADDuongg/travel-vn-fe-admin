import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Grid,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Typography,
  Empty,
  message,
} from 'antd';
import { useMemo, useState } from 'react';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTours } from '@/queries/tour.queries';
import { useTourAvailability } from '@/queries/tour.queries';
import { useEnsureTourInventory } from '@/queries/tour-inventory.queries';
import type { Tour } from '@/interface/tour';
import type { TourAvailabilityItem } from '@/interface/tour-booking';
import tableStyles from '@/styles/promax-table.module.css';
import { RBAC } from '@/constants/rbac-keys';
import { useRbac } from '@/hooks/useRbac';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function toYYYYMM(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
function currentMonth(): string {
  return toYYYYMM(new Date());
}

function getTourName(row: Pick<Tour, 'translations'>) {
  const t = row?.translations;
  return t?.vi?.name || t?.en?.name || '-';
}

const statusColor: Record<string, string> = {
  AVAILABLE: 'green',
  LIMITED: 'orange',
  FULL: 'red',
  CANCELLED: 'default',
};

export default function TourInventoryPage() {
  const { can } = useRbac();
  const screens = useBreakpoint();
  const [tourId, setTourId] = useState<string | undefined>();
  const [month, setMonth] = useState<string>(currentMonth());
  const [modalOpen, setModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: toursData } = useTours({ page: 1, limit: 50 });
  const tours = useMemo(
    () => (toursData?.items ?? []) as Tour[],
    [toursData?.items],
  );

  const {
    data: availability = [],
    isLoading: loadingAvailability,
    refetch,
    isFetching,
  } = useTourAvailability(tourId, month);
  const ensureMutation = useEnsureTourInventory();

  const filters = (
    <div className={tableStyles.filtersForm}>
      <Select
        showSearch
        placeholder="Chọn tour"
        value={tourId}
        onChange={setTourId}
        optionFilterProp="label"
        options={tours.map((t) => ({
          label: `${getTourName(t)} (${t.code})`,
          value: t._id,
        }))}
      />
      <Input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value || currentMonth())}
      />
      {can(RBAC.inventory.manage) ? (
        <Button
          type="primary"
          disabled={!tourId}
          onClick={() => {
            form.setFieldsValue({
              departureDate: null,
              totalSlots: 20,
              specialPrice: undefined,
            });
            setModalOpen(true);
          }}
        >
          Thêm / Cập nhật slots
        </Button>
      ) : null}
    </div>
  );

  const handleEnsure = async () => {
    const values = await form.validateFields();
    const dep = values.departureDate;
    let departureDate = '';
    if (dep) {
      if (dep instanceof Date) {
        departureDate = dep.toISOString().slice(0, 10);
      } else if (
        typeof (dep as { format?: (s: string) => string }).format === 'function'
      ) {
        departureDate = (dep as { format: (s: string) => string }).format(
          'YYYY-MM-DD',
        );
      } else {
        departureDate = String(dep).slice(0, 10);
      }
    }
    if (!tourId || !departureDate) {
      message.error('Chọn tour và ngày khởi hành.');
      return;
    }
    await ensureMutation.mutateAsync({
      tourId,
      departureDate,
      totalSlots: values.totalSlots,
      specialPrice: values.specialPrice ?? undefined,
    });
    message.success('Đã cập nhật inventory.');
    form.resetFields();
    setModalOpen(false);
  };

  return (
    <div className={tableStyles.page} style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card className={tableStyles.mainCard}>
          <div className={tableStyles.header}>
            <div className={tableStyles.titleWrap}>
              <Title level={screens.sm ? 4 : 5} style={{ margin: 0 }}>
                Tour Inventory
              </Title>
              <Text type="secondary" style={{ fontSize: screens.sm ? 13 : 12 }}>
                Theo dõi tình trạng slots theo tháng và cập nhật nhanh khi cần.
              </Text>
            </div>

            <div className={tableStyles.toolbar}>
              {!screens.md && (
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setFiltersOpen(true)}
                >
                  Bộ lọc
                </Button>
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={isFetching}
                disabled={!tourId}
              >
                Làm mới
              </Button>
            </div>
          </div>

          {screens.md ? (
            <div style={{ marginTop: 12 }}>{filters}</div>
          ) : (
            <Drawer
              title="Bộ lọc"
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              placement="right"
              width={360}
            >
              {filters}
            </Drawer>
          )}

          <Table<TourAvailabilityItem>
            rowKey="departureDate"
            loading={loadingAvailability}
            dataSource={availability}
            pagination={false}
            size={screens.md ? 'middle' : 'small'}
            scroll={{ x: 700 }}
            locale={{
              emptyText: (
                <Empty
                  description={
                    <span>
                      Chưa có dữ liệu. Hãy chọn tour và tháng để xem inventory.
                    </span>
                  }
                />
              ),
            }}
            columns={[
              {
                title: 'Ngày khởi hành',
                dataIndex: 'departureDate',
                width: 160,
                render: (d: string) => d?.slice(0, 10),
              },
              {
                title: 'Còn trống',
                dataIndex: 'availableSlots',
                width: 160,
                render: (v: number, r) => `${v} / ${r.totalSlots}`,
              },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                width: 140,
                render: (s: string) => (
                  <span style={{ color: statusColor[s] || undefined }}>{s}</span>
                ),
              },
              {
                title: 'Giá đặc biệt',
                dataIndex: 'specialPrice',
                width: 200,
                render: (v: number | null, r) =>
                  v != null
                    ? `${Number(v).toLocaleString()} ${r.currency || 'VND'}`
                    : '—',
              },
            ]}
          />
      </Card>

      <Modal
        title="Thêm / Cập nhật inventory"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleEnsure}
        confirmLoading={ensureMutation.isPending}
        okText="Lưu"
      >
        <Form form={form} layout="vertical" initialValues={{ totalSlots: 20 }}>
          <Form.Item
            name="departureDate"
            label="Ngày khởi hành"
            rules={[{ required: true, message: 'Chọn ngày' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="totalSlots"
            label="Tổng số chỗ"
            rules={[
              { required: true, message: 'Nhập số chỗ' },
              { type: 'number', min: 1 },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="specialPrice" label="Giá đặc biệt (VND, tùy chọn)">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Để trống dùng giá tour"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
