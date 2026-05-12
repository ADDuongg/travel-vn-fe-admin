import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TourQueryParams, TourUpsertPayload } from '@/interface/tour';
import {
  createTour,
  deleteTour,
  getFeaturedTours,
  getTour,
  getTourAvailability,
  getTourBySlug,
  getTourOptions,
  getTours,
  updateTour,
} from '@/services/tour.service';

export const TOUR_KEYS = {
  all: ['tours'] as const,
  list: (params?: TourQueryParams) => ['tours', params] as const,
  detail: (id: string) => ['tours', id] as const,
  slug: (slug: string) => ['tours', 'slug', slug] as const,
  options: (params?: { destinationId?: string }) => ['tours', 'options', params] as const,
  featured: (params?: { limit?: number }) => ['tours', 'featured', params] as const,
  availability: (tourId: string, month?: string) =>
    ['tours', tourId, 'availability', month] as const,
};

export const useTours = (params?: TourQueryParams) =>
  useQuery({
    queryKey: TOUR_KEYS.list(params),
    queryFn: () => getTours(params),
  });

export const useTour = (id?: string) =>
  useQuery({
    queryKey: id ? TOUR_KEYS.detail(id) : [],
    queryFn: () => getTour(id!),
    enabled: !!id,
  });

export const useTourBySlug = (slug?: string) =>
  useQuery({
    queryKey: slug ? TOUR_KEYS.slug(slug) : [],
    queryFn: () => getTourBySlug(slug!),
    enabled: !!slug,
  });

export const useTourOptions = (params?: { destinationId?: string }) =>
  useQuery({
    queryKey: TOUR_KEYS.options(params),
    queryFn: () => getTourOptions(params),
    staleTime: 5 * 60 * 1000,
  });

export const useFeaturedTours = (params?: { limit?: number }) =>
  useQuery({
    queryKey: TOUR_KEYS.featured(params),
    queryFn: () => getFeaturedTours(params),
    staleTime: 5 * 60 * 1000,
  });

export const useCreateTour = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TourUpsertPayload) => createTour(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TOUR_KEYS.all });
    },
  });
};

export const useUpdateTour = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TourUpsertPayload>;
    }) => updateTour(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: TOUR_KEYS.all });
      qc.invalidateQueries({ queryKey: TOUR_KEYS.detail(id) });
    },
  });
};

export const useDeleteTour = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTour,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TOUR_KEYS.all });
    },
  });
};

/** Phase 2: Availability by month */
export const useTourAvailability = (tourId?: string, month?: string) =>
  useQuery({
    queryKey: tourId ? TOUR_KEYS.availability(tourId, month) : [],
    queryFn: () => getTourAvailability(tourId!, month),
    enabled: !!tourId,
  });
