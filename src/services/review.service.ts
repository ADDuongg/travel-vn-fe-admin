import api from '@/lib/axios';

export type ReviewEntityType = 'ROOM' | 'HOTEL' | 'TOUR' | 'BLOG';

export type Review = {
  _id: string;
  entityType: ReviewEntityType;
  entityId: string;
  rating?: number;
  comment?: string;
  isApproved: boolean;
  userId?: {
    _id: string;
    email?: string;
    username?: string;
  };
  createdAt: string;
};

export type AdminReviewListResponse = {
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

export type GetAdminReviewsParams = {
  entityType?: ReviewEntityType;
  entityId?: string;
  isApproved?: boolean;
  page: number;
  limit: number;
};

export const getAdminReviews = (params: GetAdminReviewsParams) =>
  api.get<AdminReviewListResponse>('/api/v1/reviews/admin', {
    params,
  });

export const approveReview = (id: string) =>
  api.patch(`/api/v1/reviews/${id}/approve`);

export const deleteReview = (id: string) => api.delete(`/api/v1/reviews/${id}`);
