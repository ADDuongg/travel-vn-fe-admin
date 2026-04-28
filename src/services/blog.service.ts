import api from '@/lib/axios';
import type {
  BlogCategory,
  BlogPost,
  BlogTag,
  BlogTagQueryParams,
  BlogPostUpsertPayload,
  BlogPostAdminQueryParams,
  CreateBlogCategoryPayload,
  CreateBlogTagPayload,
  BlogCategoryQueryParams,
  PaginatedResponse,
  UpdateBlogCategoryPayload,
  UpdateBlogTagPayload,
} from '@/interface/blog';

/** FE Admin SPA only — `/api/v1/admin/...`. See docs/api/FE-ADMIN-API.md. */

/* Categories */

export const getBlogCategories = (
  params?: BlogCategoryQueryParams,
): Promise<PaginatedResponse<BlogCategory>> => {
  return api.get('/api/v1/admin/blog-categories', { params });
};

export const createBlogCategory = (
  data: CreateBlogCategoryPayload,
): Promise<BlogCategory> => {
  return api.post<BlogCategory, CreateBlogCategoryPayload>(
    '/api/v1/admin/blog-categories',
    data,
  );
};

export const updateBlogCategory = (
  id: string,
  data: UpdateBlogCategoryPayload,
): Promise<BlogCategory> => {
  return api.patch<BlogCategory, UpdateBlogCategoryPayload>(
    `/api/v1/admin/blog-categories/${id}`,
    data,
  );
};

export const deleteBlogCategory = (id: string): Promise<unknown> => {
  return api.delete(`/api/v1/admin/blog-categories/${id}`);
};

/* Tags */

export const getBlogTags = (
  params?: BlogTagQueryParams,
): Promise<PaginatedResponse<BlogTag>> => {
  return api.get('/api/v1/admin/blog-tags', { params });
};

export const createBlogTag = (data: CreateBlogTagPayload): Promise<BlogTag> => {
  return api.post<BlogTag, CreateBlogTagPayload>(
    '/api/v1/admin/blog-tags',
    data,
  );
};

export const updateBlogTag = (
  id: string,
  data: UpdateBlogTagPayload,
): Promise<BlogTag> => {
  return api.patch<BlogTag, UpdateBlogTagPayload>(
    `/api/v1/admin/blog-tags/${id}`,
    data,
  );
};

export const deleteBlogTag = (id: string): Promise<unknown> => {
  return api.delete(`/api/v1/admin/blog-tags/${id}`);
};

/* Posts (admin) */

export const getBlogPostsAdmin = (
  params?: BlogPostAdminQueryParams,
): Promise<PaginatedResponse<BlogPost>> => {
  return api.get('/api/v1/admin/blogs', { params });
};

export const getBlogPostAdmin = (id: string): Promise<BlogPost> => {
  return api.get(`/api/v1/admin/blogs/${id}`);
};

export const createBlogPost = (data: BlogPostUpsertPayload): Promise<BlogPost> => {
  return api.post<BlogPost, BlogPostUpsertPayload>('/api/v1/admin/blogs', data);
};

export const updateBlogPost = (
  id: string,
  data: Partial<BlogPostUpsertPayload>,
): Promise<BlogPost> => {
  return api.patch<BlogPost, Partial<BlogPostUpsertPayload>>(
    `/api/v1/admin/blogs/${id}`,
    data,
  );
};

export const publishBlogPost = (id: string): Promise<BlogPost> => {
  return api.patch<BlogPost, object>(`/api/v1/admin/blogs/${id}/publish`, {});
};

export const unpublishBlogPost = (id: string): Promise<BlogPost> => {
  return api.patch<BlogPost, object>(`/api/v1/admin/blogs/${id}/unpublish`, {});
};

export const deleteBlogPost = (id: string): Promise<unknown> => {
  return api.delete(`/api/v1/admin/blogs/${id}`);
};
