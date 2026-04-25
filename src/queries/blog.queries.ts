import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BlogPostUpsertPayload,
  CreateBlogCategoryPayload,
  CreateBlogTagPayload,
  UpdateBlogCategoryPayload,
  UpdateBlogTagPayload,
  BlogCategoryQueryParams,
  BlogTagQueryParams,
  BlogPostAdminQueryParams,
} from '@/interface/blog';
import {
  createBlogCategory,
  createBlogTag,
  createBlogPost,
  deleteBlogCategory,
  deleteBlogPost,
  deleteBlogTag,
  getBlogCategories,
  getBlogPostAdmin,
  getBlogPostsAdmin,
  getBlogTags,
  publishBlogPost,
  unpublishBlogPost,
  updateBlogCategory,
  updateBlogPost,
  updateBlogTag,
} from '@/services/blog.service';

export const BLOG_CATEGORY_KEYS = {
  all: ['blog-categories'] as const,
  list: (params?: BlogCategoryQueryParams) =>
    ['blog-categories', 'list', params] as const,
};

export const BLOG_TAG_KEYS = {
  all: ['blog-tags'] as const,
  list: (params?: BlogTagQueryParams) => ['blog-tags', 'list', params] as const,
};

export const BLOG_POST_KEYS = {
  all: ['blog-posts'] as const,
  adminList: (params?: BlogPostAdminQueryParams) =>
    ['blog-posts', 'admin', params] as const,
  adminDetail: (id: string) => ['blog-posts', 'admin', id] as const,
};

export const useBlogCategories = (params?: BlogCategoryQueryParams) =>
  useQuery({
    queryKey: BLOG_CATEGORY_KEYS.list(params),
    queryFn: () => getBlogCategories(params),
  });

/** Dropdown: keep limit within API max (large limits return 400 on some BE builds). */
export const useBlogCategoryOptions = () =>
  useQuery({
    queryKey: BLOG_CATEGORY_KEYS.list({ page: 1, limit: 100 }),
    queryFn: () => getBlogCategories({ page: 1, limit: 100 }),
    staleTime: 2 * 60 * 1000,
  });

export const useCreateBlogCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlogCategoryPayload) => createBlogCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BLOG_CATEGORY_KEYS.all });
    },
  });
};

export const useUpdateBlogCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBlogCategoryPayload;
    }) => updateBlogCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BLOG_CATEGORY_KEYS.all });
    },
  });
};

export const useDeleteBlogCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBlogCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BLOG_CATEGORY_KEYS.all });
      qc.invalidateQueries({ queryKey: BLOG_POST_KEYS.all });
    },
  });
};

export const useBlogTags = (params?: BlogTagQueryParams) =>
  useQuery({
    queryKey: BLOG_TAG_KEYS.list(params),
    queryFn: () => getBlogTags(params),
  });

export const useBlogTagOptions = () =>
  useQuery({
    queryKey: BLOG_TAG_KEYS.list({ page: 1, limit: 100 }),
    queryFn: () => getBlogTags({ page: 1, limit: 100 }),
    staleTime: 2 * 60 * 1000,
  });

export const useCreateBlogTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlogTagPayload) => createBlogTag(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BLOG_TAG_KEYS.all });
    },
  });
};

export const useUpdateBlogTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBlogTagPayload;
    }) => updateBlogTag(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BLOG_TAG_KEYS.all });
    },
  });
};

export const useDeleteBlogTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBlogTag,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BLOG_TAG_KEYS.all });
      qc.invalidateQueries({ queryKey: BLOG_POST_KEYS.all });
    },
  });
};

export const useBlogPostsAdmin = (params?: BlogPostAdminQueryParams) =>
  useQuery({
    queryKey: BLOG_POST_KEYS.adminList(params),
    queryFn: () => getBlogPostsAdmin(params),
  });

export const useBlogPostAdmin = (id?: string) =>
  useQuery({
    queryKey: id ? BLOG_POST_KEYS.adminDetail(id) : [],
    queryFn: () => getBlogPostAdmin(id!),
    enabled: !!id,
  });

export const useCreateBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BlogPostUpsertPayload) => createBlogPost(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BLOG_POST_KEYS.all });
    },
  });
};

export const useUpdateBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BlogPostUpsertPayload>;
    }) => updateBlogPost(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: BLOG_POST_KEYS.all });
      qc.invalidateQueries({ queryKey: BLOG_POST_KEYS.adminDetail(id) });
    },
  });
};

export const useDeleteBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBlogPost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BLOG_POST_KEYS.all });
    },
  });
};

export const usePublishBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishBlogPost,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: BLOG_POST_KEYS.all });
      qc.invalidateQueries({ queryKey: BLOG_POST_KEYS.adminDetail(id) });
    },
  });
};

export const useUnpublishBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unpublishBlogPost,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: BLOG_POST_KEYS.all });
      qc.invalidateQueries({ queryKey: BLOG_POST_KEYS.adminDetail(id) });
    },
  });
};
