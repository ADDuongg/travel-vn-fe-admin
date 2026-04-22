import { Button, Dropdown } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAuditLogExport } from '@/queries/audit-log.queries';
import type { AuditLogQueryParams } from '@/interface/audit-log';

interface AuditLogExportButtonProps {
  params: Omit<AuditLogQueryParams, 'page' | 'limit' | 'sortBy' | 'sortOrder'>;
}

export default function AuditLogExportButton({
  params,
}: AuditLogExportButtonProps) {
  const { mutate, isPending } = useAuditLogExport();

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: 'csv',
            icon: <FileTextOutlined />,
            label: 'Xuất CSV',
            onClick: () => mutate({ params, format: 'csv' }),
          },
          {
            key: 'xlsx',
            icon: <FileExcelOutlined />,
            label: 'Xuất Excel',
            onClick: () => mutate({ params, format: 'xlsx' }),
          },
        ],
      }}
      trigger={['click']}
    >
      <Button icon={<DownloadOutlined />} loading={isPending}>
        Xuất
      </Button>
    </Dropdown>
  );
}
