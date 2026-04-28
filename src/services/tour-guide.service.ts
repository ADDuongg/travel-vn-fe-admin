import api from '@/lib/axios';
import type {
  TourGuide,
  TourGuidePaginatedResponse,
  TourGuideQueryParams,
  TourGuideUpsertPayload,
} from '@/interface/tour-guide';

/**
 * Reads: public catalog per MODULES-9-11.
 * Mutations: admin routes.
 */

export const getTourGuides = (
  params?: TourGuideQueryParams,
): Promise<TourGuidePaginatedResponse> => {
  return api.get<TourGuidePaginatedResponse>('/api/v1/public/tour-guides', {
    params,
  });
};

export const getTourGuideById = (id: string): Promise<TourGuide> => {
  return api.get<TourGuide>(`/api/v1/public/tour-guides/${id}`);
};

export const createTourGuide = (
  payload: TourGuideUpsertPayload | FormData,
): Promise<TourGuide> => {
  if (payload instanceof FormData) {
    return api.post<TourGuide>('/api/v1/admin/tour-guides', payload, {
      headers: { 'Content-Type': undefined } as unknown as Record<string, string>,
    });
  }
  return api.post<TourGuide, TourGuideUpsertPayload>(
    '/api/v1/admin/tour-guides',
    payload,
  );
};

export const updateTourGuide = (
  id: string,
  payload: Partial<TourGuideUpsertPayload> | FormData,
): Promise<TourGuide> => {
  if (payload instanceof FormData) {
    return api.patch<TourGuide>(`/api/v1/admin/tour-guides/${id}`, payload, {
      headers: { 'Content-Type': undefined } as unknown as Record<string, string>,
    });
  }
  return api.patch<TourGuide, Partial<TourGuideUpsertPayload>>(
    `/api/v1/admin/tour-guides/${id}`,
    payload,
  );
};

export const toggleTourGuideAvailability = (id: string): Promise<TourGuide> => {
  return api.patch<TourGuide>(
    `/api/v1/admin/tour-guides/${id}/availability`,
  );
};

export const verifyTourGuide = (
  id: string,
  isVerified: boolean,
): Promise<TourGuide> => {
  return api.patch<TourGuide, { isVerified: boolean }>(
    `/api/v1/admin/tour-guides/${id}/verify`,
    { isVerified },
  );
};

export const deleteTourGuide = (
  id: string,
): Promise<{ message: string } | unknown> => {
  return api.delete(`/api/v1/admin/tour-guides/${id}`);
};
