import { Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCreateBlogPost } from '@/queries/blog.queries';
import { ROUTES } from '@/constants/route.constant';
import BlogPostForm from './components/BlogPostForm';

export default function BlogPostCreatePage() {
  const navigate = useNavigate();
  const m = useCreateBlogPost();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card title="Tạo bài blog" className="form-page-card">
        <BlogPostForm
          submitText="Tạo bài"
          loading={m.isPending}
          onSubmit={async (payload) => {
            await m.mutateAsync({ ...payload, status: 'draft' });
            message.success('Đã tạo bài');
            navigate(ROUTES.BLOG.POSTS);
          }}
          onCancel={() => navigate(-1)}
        />
      </Card>
    </div>
  );
}
