import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  TourGuidePaginatedResponse,
  TourGuideQueryParams,
  TourGuideUpsertPayload,
  TourGuide,
} from '@/interface/tour-guide';
import {
  createTourGuide,
  deleteTourGuide,
  getTourGuideById,
  getTourGuides,
  toggleTourGuideAvailability,
  updateTourGuide,
  verifyTourGuide,
} from '@/services/tour-guide.service';

export const TOUR_GUIDE_KEYS = {
  all: ['tour-guides'] as const,
  list: (params?: TourGuideQueryParams) => ['tour-guides', params] as const,
  detail: (id: string) => ['tour-guides', id] as const,
};

export const useTourGuides = (params?: TourGuideQueryParams) =>
  useQuery<TourGuidePaginatedResponse>({
    queryKey: TOUR_GUIDE_KEYS.list(params),
    queryFn: () => getTourGuides(params),
  });

export const useTourGuide = (id?: string) =>
  useQuery<TourGuide>({
    queryKey: id ? TOUR_GUIDE_KEYS.detail(id) : [],
    queryFn: () => getTourGuideById(id!),
    enabled: !!id,
  });

export const useCreateTourGuide = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TourGuideUpsertPayload) => createTourGuide(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TOUR_GUIDE_KEYS.all });
    },
  });
};

export const useUpdateTourGuide = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<TourGuideUpsertPayload>;
    }) => updateTourGuide(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: TOUR_GUIDE_KEYS.all });
      qc.invalidateQueries({ queryKey: TOUR_GUIDE_KEYS.detail(id) });
    },
  });
};

export const useToggleTourGuideAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleTourGuideAvailability(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: TOUR_GUIDE_KEYS.all });
      qc.invalidateQueries({ queryKey: TOUR_GUIDE_KEYS.detail(data._id) });
    },
  });
};

export const useVerifyTourGuide = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      isVerified,
    }: {
      id: string;
      isVerified: boolean;
    }) => verifyTourGuide(id, isVerified),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: TOUR_GUIDE_KEYS.all });
      qc.invalidateQueries({ queryKey: TOUR_GUIDE_KEYS.detail(data._id) });
    },
  });
};

export const useDeleteTourGuide = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTourGuide(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TOUR_GUIDE_KEYS.all });
    },
  });
};

