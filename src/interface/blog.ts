import type { DynamicLocalized } from '@/lib/dynamic-localized';
import type { TourImage } from '@/interface/tour';

/** Matches BE / plan `EditorJsBlock` */
export type EditorJsBlock = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

export type BlogSeo = {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
};

export type BlogPostTranslation = {
  title: string;
  excerpt?: string;
  content: EditorJsBlock[];
  tableOfContents?: TocItem[];
  readingTime?: number;
  seo?: BlogSeo;
};

export type BlogCategorySeo = {
  title?: string;
  description?: string;
  keywords?: string[];
};

export type BlogCategoryTranslation = {
  seo?: BlogCategorySeo;
};

export type BlogCategoryThumbnail = {
  url: string;
  publicId?: string;
  alt?: string;
};

export interface BlogCategory {
  _id: string;
  name: DynamicLocalized;
  slug: string;
  description?: DynamicLocalized;
  thumbnail?: BlogCategoryThumbnail;
  order?: number;
  isActive?: boolean;
  postCount?: number;
  translations?: Record<string, BlogCategoryTranslation>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogTag {
  _id: string;
  name: DynamicLocalized;
  slug: string;
  isActive?: boolean;
  postCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type BlogPostStatus = 'draft' | 'published';

export type BlogAuthor = {
  _id: string;
  username?: string;
  email?: string;
  fullName?: string;
};

export type BlogRef =
  | string
  | { _id: string; slug?: string; name?: DynamicLocalized; translations?: unknown; postCount?: number };

export interface BlogPost {
  _id: string;
  slug: string;
  status: BlogPostStatus;
  isFeatured?: boolean;
  author?: string | BlogAuthor;
  category: BlogRef | null;
  tags?: (string | BlogTag)[];
  relatedProvinces?: (string | { _id: string; name?: unknown; slug?: string })[];
  relatedTours?: (string | { _id: string; name?: unknown; slug?: string; code?: string })[];
  relatedHotels?: (string | { _id: string; slug?: string; name?: unknown })[];
  thumbnail?: TourImage;
  gallery?: (TourImage & { order?: number })[];
  translations: Record<string, BlogPostTranslation>;
  viewCount?: number;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: Pagination;
};

export type BlogCategoryQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type BlogTagQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type BlogPostAdminQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogPostStatus;
  category?: string;
};

export type CreateBlogCategoryPayload = {
  name: DynamicLocalized;
  slug?: string;
  description?: DynamicLocalized;
  thumbnail?: BlogCategoryThumbnail;
  order?: number;
  isActive?: boolean;
  translations?: Record<string, BlogCategoryTranslation>;
};

export type UpdateBlogCategoryPayload = Partial<CreateBlogCategoryPayload>;

export type CreateBlogTagPayload = {
  name: DynamicLocalized;
  slug?: string;
  isActive?: boolean;
};

export type UpdateBlogTagPayload = Partial<CreateBlogTagPayload>;

export type BlogPostUpsertPayload = {
  slug: string;
  isFeatured?: boolean;
  category?: string | null;
  tags?: string[];
  relatedProvinces?: string[];
  relatedTours?: string[];
  relatedHotels?: string[];
  thumbnail?: TourImage;
  gallery?: (TourImage & { order?: number })[];
  translations: Record<string, Partial<BlogPostTranslation> & { title: string }>;
  status?: BlogPostStatus;
};
