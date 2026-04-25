import { Card, Spin, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useBlogPostAdmin, useUpdateBlogPost } from '@/queries/blog.queries';
import { ROUTES } from '@/constants/route.constant';
import BlogPostForm from './components/BlogPostForm';

export default function BlogPostUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useBlogPostAdmin(id);
  const m = useUpdateBlogPost();

  if (isLoading || !id) {
    return (
      <Card className="form-page-card">
        <Spin />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="form-page-card">
        Không tìm thấy bài viết
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card title="Chỉnh sửa bài blog" className="form-page-card">
        <BlogPostForm
          initialValues={data}
          submitText="Cập nhật"
          loading={m.isPending}
          onSubmit={async (payload) => {
            await m.mutateAsync({ id, data: payload });
            message.success('Đã cập nhật');
            navigate(ROUTES.BLOG.POSTS);
          }}
          onCancel={() => navigate(-1)}
        />
      </Card>
    </div>
  );
}
