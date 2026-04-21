import api from '@/lib/axios';

export type ReviewEntityType = 'ROOM' | 'HOTEL' | 'TOUR' | 'BLOG' | 'GUIDE';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';

type ModeratorRef = string | { _id: string; email?: string; username?: string };

export type Review = {
  _id: string;
  entityType: ReviewEntityType;
  entityId: string;
  rating?: number;
  comment?: string;
  status: ReviewStatus;
  userId?: {
    _id: string;
    email?: string;
    username?: string;
  };
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  approvedAt?: string;
  approvedBy?: ModeratorRef;
  rejectedAt?: string;
  rejectedBy?: ModeratorRef;
  rejectReason?: string;
  hiddenAt?: string;
  hiddenBy?: ModeratorRef;
  hiddenReason?: string;
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
  /** CSV on wire: multiple values joined with comma */
  status?: ReviewStatus | ReviewStatus[];
  includeDeleted?: boolean;
  page: number;
  limit: number;
};

export type UpdateReviewStatusPayload = {
  status: ReviewStatus;
  rejectReason?: string;
  hiddenReason?: string;
};

function buildAdminReviewsQueryParams(params: GetAdminReviewsParams) {
  const { status, includeDeleted, ...rest } = params;
  const query: Record<string, unknown> = { ...rest };
  if (status !== undefined) {
    query.status = Array.isArray(status) ? status.join(',') : status;
  }
  if (includeDeleted === true) {
    query.includeDeleted = true;
  }
  return query;
}

export const getAdminReviews = (params: GetAdminReviewsParams) =>
  api.get<AdminReviewListResponse>('/api/v1/reviews/admin', {
    params: buildAdminReviewsQueryParams(params),
  });

export const approveReview = (id: string) =>
  api.patch(`/api/v1/reviews/${id}/approve`);

export const updateReviewStatus = (
  id: string,
  payload: UpdateReviewStatusPayload,
) => api.patch(`/api/v1/reviews/${id}/status`, payload);

export const deleteReview = (id: string) => api.delete(`/api/v1/reviews/${id}`);
