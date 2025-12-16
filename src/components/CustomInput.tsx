// AntdFormInput.tsx
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Input,
  Select,
  Checkbox,
  DatePicker,
  Typography,
  Space,
  InputNumber,
} from 'antd';
import type { Dayjs } from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

type Option = { label: string; value: string | number };

type AntdInputType =
  | 'text'
  | 'textarea'
  | 'password'
  | 'number'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'date'
  | 'date-range'
  | 'autocomplete'
  | 'custom-input';

export interface AntdFormInputProps {
  name: string;
  type: AntdInputType;
  label?: string;
  labelPosition?: 'vertical' | 'horizontal';
  options?: Option[];
  placeholder?: string;
  // render tùy biến khi type = 'custom-input'
  render?: (field: any) => React.ReactNode;

  // chuyển đổi giá trị date -> string (nếu bạn muốn lưu ISO)
  dateToValue?: (d: Dayjs | null) => any;
  dateFromValue?: (raw: any) => Dayjs | null;

  // chuyển đổi giá trị range -> tuple
  rangeToValue?: (d: [Dayjs | null, Dayjs | null] | null) => any;
  rangeFromValue?: (raw: any) => [Dayjs | null, Dayjs | null] | null;

  // các props khác sẽ được truyền xuống component antd
  [key: string]: any;
}

const AntdFormInput: React.FC<AntdFormInputProps> = ({
  name,
  type,
  label,
  labelPosition = 'vertical',
  options = [],
  placeholder,
  render,

  // mặc định: giữ nguyên kiểu Dayjs, không convert
  dateToValue = (d) => d,
  dateFromValue = (raw) => raw ?? null,
  rangeToValue = (d) => d,
  rangeFromValue = (raw) => raw ?? null,

  ...rest
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const errorMsg =
    (errors as any)?.[name]?.message ??
    (typeof (errors as any)?.[name] === 'string'
      ? (errors as any)[name]
      : undefined);

  const isHorizontal = labelPosition === 'horizontal';

  const renderField = (field: any) => {
    switch (type) {
      case 'checkbox':
        return (
          <Checkbox
            checked={!!field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            {...rest}
          >
            {label /* checkbox hiển thị label bên phải */}
          </Checkbox>
        );

      case 'select':
        return (
          <Select
            value={field.value}
            onChange={field.onChange}
            options={options}
            placeholder={placeholder}
            {...rest}
          />
        );

      case 'multi-select':
        return (
          <Select
            mode="multiple"
            value={field.value ?? []}
            onChange={field.onChange}
            options={options}
            placeholder={placeholder}
            {...rest}
          />
        );

      case 'autocomplete':
        return (
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            value={field.value}
            onChange={field.onChange}
            options={options}
            placeholder={placeholder}
            {...rest}
          />
        );

      case 'date': {
        const v: Dayjs | null = dateFromValue(field.value);
        return (
          <DatePicker
            value={v}
            onChange={(d) => field.onChange(dateToValue(d))}
            placeholder={placeholder}
            {...rest}
          />
        );
      }

      case 'date-range': {
        const v: [Dayjs | null, Dayjs | null] | null = rangeFromValue(
          field.value,
        );
        return (
          <RangePicker
            value={v ?? undefined}
            onChange={(d) => field.onChange(rangeToValue(d ?? null))}
            placeholder={[
              rest?.placeholderStart ?? 'Start date',
              rest?.placeholderEnd ?? 'End date',
            ]}
            {...rest}
          />
        );
      }

      case 'number':
        return (
          <InputNumber
            value={field.value}
            onChange={field.onChange}
            placeholder={placeholder}
            style={{ width: '100%' }}
            {...rest}
          />
        );

      case 'password':
        return (
          <Input.Password {...field} placeholder={placeholder} {...rest} />
        );

      case 'textarea':
        return (
          <TextArea
            {...field}
            placeholder={placeholder}
            autoSize={{ minRows: 3 }}
            {...rest}
          />
        );

      case 'custom-input':
        return render ? render(field) : null;

      case 'text':
      default:
        return <Input {...field} placeholder={placeholder} {...rest} />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: isHorizontal ? 12 : 6,
        alignItems: isHorizontal ? 'center' : 'stretch',
        width: '100%',
      }}
      className={rest.className}
    >
      {/* Với checkbox, label nằm trong chính component */}
      {type !== 'checkbox' && label && (
        <Text style={{ minWidth: isHorizontal ? 140 : undefined }}>
          {label}
        </Text>
      )}

      <Space direction="vertical" size={4} style={{ flex: 1, width: '100%' }}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => <>{renderField(field)}</>}
        />

        {errorMsg && (
          <Text type="danger" style={{ fontSize: 12 }}>
            {String(errorMsg)}
          </Text>
        )}
      </Space>
    </div>
  );
};

export default AntdFormInput;
