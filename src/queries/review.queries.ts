import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getAdminReviews,
  approveReview,
  deleteReview,
  updateReviewStatus,
} from '@/services/review.service';
import type { UpdateReviewStatusPayload } from '@/services/review.service';
import type { GetAdminReviewsParams } from '@/services/review.service';

/* ================= QUERY KEY ================= */

export const ADMIN_REVIEW_QUERY_KEY = ['admin-reviews'];

/* ================= LIST ================= */

export const useAdminReviews = (params: GetAdminReviewsParams) =>
  useQuery({
    queryKey: [...ADMIN_REVIEW_QUERY_KEY, params],
    queryFn: () => getAdminReviews(params),
    placeholderData: keepPreviousData,
  });

/* ================= APPROVE ================= */

export const useApproveReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_REVIEW_QUERY_KEY,
      });
    },
  });
};

/* ================= UPDATE STATUS ================= */

export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateReviewStatusPayload;
    }) => updateReviewStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_REVIEW_QUERY_KEY,
      });
    },
  });
};

/* ================= DELETE ================= */

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_REVIEW_QUERY_KEY,
      });
    },
  });
};
