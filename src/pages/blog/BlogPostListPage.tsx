import { ROUTES } from '@/constants/route.constant';
import type { BlogPost, BlogPostStatus } from '@/interface/blog';
import { pickDynamicLocalized } from '@/lib/dynamic-localized';
import {
  useBlogPostsAdmin,
  useDeleteBlogPost,
  usePublishBlogPost,
  useUnpublishBlogPost,
} from '@/queries/blog.queries';
import { DeleteOutlined, EditOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons';
import {
  Button,
  Image,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '@/components/PageShell';

const defaultPageSize = 20;

function postTitle(p: BlogPost) {
  const t = p.translations;
  if (!t) return '—';
  return (
    t.vi?.title ||
    t.en?.title ||
    Object.values(t).find((x) => x?.title)?.title ||
    '—'
  );
}

function categoryName(p: BlogPost) {
  const c = p.category;
  if (!c) return '—';
  if (typeof c === 'string') return c;
  if (c.name) return pickDynamicLocalized(c.name);
  return c.slug || '—';
}

function authorName(p: BlogPost) {
  const a = p.author;
  if (typeof a === 'string') return a;
  if (a && typeof a === 'object') {
    return a.username || a.email || a._id || '—';
  }
  return '—';
}

export default function BlogPostListPage() {
  const nav = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultPageSize);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BlogPostStatus | undefined>(undefined);
  const [searchDebounced, setSearchDebounced] = useState('');

  const params = useMemo(
    () => ({
      page,
      limit,
      search: searchDebounced || undefined,
      status,
    }),
    [page, limit, searchDebounced, status],
  );

  const { data, isLoading, isFetching, refetch } = useBlogPostsAdmin(params);
  const deleteM = useDeleteBlogPost();
  const publishM = usePublishBlogPost();
  const unpublishM = useUnpublishBlogPost();

  const items: BlogPost[] = useMemo(
    () => (Array.isArray((data as { items?: BlogPost[] })?.items) ? (data as { items: BlogPost[] }).items : []),
    [data],
  );
  const total =
    (data as { pagination?: { total?: number } })?.pagination?.total ??
    (data as { total?: number })?.total ??
    0;

  const onSearch = () => {
    setPage(1);
    setSearchDebounced(search.trim());
  };

  const columns: TableColumnsType<BlogPost> = useMemo(
    () => [
      {
        title: 'Ảnh',
        dataIndex: 'thumbnail',
        width: 80,
        render: (th: BlogPost['thumbnail']) =>
          th?.url ? (
            <Image
              width={48}
              height={48}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              src={th.url}
              alt=""
            />
          ) : (
            '—'
          ),
      },
      { title: 'Tiêu đề', dataIndex: '_id', render: (_, row) => postTitle(row) },
      { title: 'Category', dataIndex: 'category', render: (_, row) => categoryName(row) },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        width: 120,
        render: (s: BlogPostStatus) => (
          <Tag color={s === 'published' ? 'green' : 'orange'}>{s}</Tag>
        ),
      },
      { title: 'Tác giả', width: 120, dataIndex: 'author', render: (_, row) => authorName(row) },
      { title: 'Views', dataIndex: 'viewCount', width: 80 },
      {
        title: 'Published',
        dataIndex: 'publishedAt',
        width: 160,
        render: (d: string | undefined) => (d ? new Date(d).toLocaleString() : '—'),
      },
      {
        title: '',
        key: 'actions',
        width: 220,
        render: (_: unknown, row) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => nav(ROUTES.BLOG.EDIT(row._id))}
            >
              Sửa
            </Button>
            {row.status === 'draft' ? (
              <Button
                type="link"
                size="small"
                onClick={() => void publishM.mutateAsync(row._id).then(() => refetch())}
                loading={publishM.isPending}
              >
                Publish
              </Button>
            ) : (
              <Button
                type="link"
                size="small"
                onClick={() => void unpublishM.mutateAsync(row._id).then(() => refetch())}
                loading={unpublishM.isPending}
              >
                Unpublish
              </Button>
            )}
            <Popconfirm
              title="Xoá bài viết?"
              onConfirm={() => void deleteM.mutateAsync(String(row._id))}
            >
              <Button type="text" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [nav, deleteM, publishM, unpublishM, refetch],
  );

  return (
    <PageShell
      title="Blog — Bài viết"
      subtitle="Tạo, chỉnh sửa và xuất bản bài viết"
      actions={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => nav(ROUTES.BLOG.CREATE)}>
          Thêm bài
        </Button>
      }
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        <Input
          allowClear
          style={{ maxWidth: 280 }}
          placeholder="Tìm theo tiêu đề…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={onSearch}
        />
        <Button type="default" onClick={onSearch}>
          Tìm
        </Button>
        <Select
          allowClear
          placeholder="Trạng thái"
          style={{ minWidth: 140 }}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
          ]}
        />
        <Button icon={<RedoOutlined />} onClick={() => void refetch()} loading={isFetching} />
      </div>

      <Table<BlogPost>
        rowKey="_id"
        loading={isLoading}
        dataSource={items}
        columns={columns}
        scroll={{ x: 960 }}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          onChange: (p, ps) => {
            setPage(p);
            setLimit(ps);
          },
        }}
      />
    </PageShell>
  );
}
