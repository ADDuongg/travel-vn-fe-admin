import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, DatePicker, Drawer, Grid, Input, Select, Space } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import {
  CATEGORY_OPTIONS,
  ACTION_BY_CATEGORY,
  ACTION_CONFIG,
  RESOURCE_TYPE_OPTIONS,
} from '@/constants/audit-log.constants';
import type {
  AuditLogCategory,
  AuditLogAction,
  AuditResourceType,
} from '@/interface/audit-log';
import { useUsers } from '@/queries/user.queries';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface FilterValues {
  userId?: string;
  category?: AuditLogCategory;
  action?: AuditLogAction;
  resourceType?: AuditResourceType;
  ip?: string;
  fromDate?: string;
  toDate?: string;
}

interface AuditLogFilterProps {
  values: FilterValues;
  onChange: (filters: Record<string, string | undefined>) => void;
}

export default function AuditLogFilter({ values, onChange }: AuditLogFilterProps) {
  const screens = Grid.useBreakpoint();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ipValue, setIpValue] = useState(values.ip ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: users } = useUsers();

  useEffect(() => {
    setIpValue(values.ip ?? '');
  }, [values.ip]);

  const handleIpChange = useCallback(
    (val: string) => {
      setIpValue(val);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange({ ip: val || undefined });
      }, 300);
    },
    [onChange],
  );

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const actionOptions = useMemo(() => {
    if (!values.category) return [];
    return ACTION_BY_CATEGORY[values.category].map((a) => ({
      label: ACTION_CONFIG[a].label,
      value: a,
    }));
  }, [values.category]);

  const userOptions = useMemo(
    () =>
      (users ?? []).map((u) => ({
        label: u.username || u.email || u._id,
        value: u._id,
      })),
    [users],
  );

  const handleClear = useCallback(() => {
    onChange({
      userId: undefined,
      category: undefined,
      action: undefined,
      resourceType: undefined,
      ip: undefined,
      fromDate: undefined,
      toDate: undefined,
    });
    setIpValue('');
  }, [onChange]);

  const hasActiveFilters = Object.values(values).some(Boolean);

  const dateValue = useMemo(() => {
    if (values.fromDate && values.toDate) {
      return [dayjs(values.fromDate), dayjs(values.toDate)] as [
        dayjs.Dayjs,
        dayjs.Dayjs,
      ];
    }
    return null;
  }, [values.fromDate, values.toDate]);

  const filterContent = (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 12,
        alignItems: 'center',
      }}
    >
      <Select
        placeholder="Người dùng"
        allowClear
        showSearch
        optionFilterProp="label"
        value={values.userId}
        onChange={(v) => onChange({ userId: v ?? undefined })}
        options={userOptions}
        style={{ minWidth: 160 }}
      />

      <Select
        placeholder="Loại sự kiện"
        allowClear
        value={values.category}
        onChange={(v) =>
          onChange({ category: v ?? undefined, action: undefined })
        }
        options={CATEGORY_OPTIONS}
        style={{ minWidth: 140 }}
      />

      <Select
        placeholder="Hành động"
        allowClear
        value={values.action}
        onChange={(v) => onChange({ action: v ?? undefined })}
        options={actionOptions}
        disabled={!values.category}
        style={{ minWidth: 180 }}
      />

      <Select
        placeholder="Loại tài nguyên"
        allowClear
        value={values.resourceType}
        onChange={(v) => onChange({ resourceType: v ?? undefined })}
        options={RESOURCE_TYPE_OPTIONS}
        style={{ minWidth: 150 }}
      />

      <Input
        placeholder="Địa chỉ IP"
        allowClear
        value={ipValue}
        onChange={(e) => handleIpChange(e.target.value)}
        style={{ minWidth: 140, maxWidth: 180 }}
      />

      <RangePicker
        value={dateValue}
        onChange={(dates) => {
          if (dates && dates[0] && dates[1]) {
            onChange({
              fromDate: dates[0].format('YYYY-MM-DD'),
              toDate: dates[1].format('YYYY-MM-DD'),
            });
          } else {
            onChange({ fromDate: undefined, toDate: undefined });
          }
        }}
        format="DD/MM/YYYY"
        style={{ minWidth: 240 }}
      />

      {hasActiveFilters && (
        <Button icon={<ClearOutlined />} onClick={handleClear} size="small">
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );

  if (!screens.md) {
    return (
      <>
        <Space style={{ marginTop: 12 }}>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFiltersOpen(true)}
          >
            Bộ lọc
            {hasActiveFilters && (
              <span
                style={{
                  marginLeft: 4,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent-orange)',
                  display: 'inline-block',
                }}
              />
            )}
          </Button>
        </Space>
        <Drawer
          title="Bộ lọc"
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          placement="right"
          width={360}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Select
              placeholder="Người dùng"
              allowClear
              showSearch
              optionFilterProp="label"
              value={values.userId}
              onChange={(v) => onChange({ userId: v ?? undefined })}
              options={userOptions}
              style={{ width: '100%' }}
            />
            <Select
              placeholder="Loại sự kiện"
              allowClear
              value={values.category}
              onChange={(v) =>
                onChange({ category: v ?? undefined, action: undefined })
              }
              options={CATEGORY_OPTIONS}
              style={{ width: '100%' }}
            />
            <Select
              placeholder="Hành động"
              allowClear
              value={values.action}
              onChange={(v) => onChange({ action: v ?? undefined })}
              options={actionOptions}
              disabled={!values.category}
              style={{ width: '100%' }}
            />
            <Select
              placeholder="Loại tài nguyên"
              allowClear
              value={values.resourceType}
              onChange={(v) => onChange({ resourceType: v ?? undefined })}
              options={RESOURCE_TYPE_OPTIONS}
              style={{ width: '100%' }}
            />
            <Input
              placeholder="Địa chỉ IP"
              allowClear
              value={ipValue}
              onChange={(e) => handleIpChange(e.target.value)}
            />
            <RangePicker
              value={dateValue}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  onChange({
                    fromDate: dates[0].format('YYYY-MM-DD'),
                    toDate: dates[1].format('YYYY-MM-DD'),
                  });
                } else {
                  onChange({ fromDate: undefined, toDate: undefined });
                }
              }}
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
            />
            {hasActiveFilters && (
              <Button
                icon={<ClearOutlined />}
                onClick={handleClear}
                block
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </Drawer>
      </>
    );
  }

  return filterContent;
}
