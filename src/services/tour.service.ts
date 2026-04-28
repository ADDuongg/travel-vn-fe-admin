import api from '@/lib/axios';
import type {
  Tour,
  TourOption,
  TourPaginatedResponse,
  TourQueryParams,
  TourUpsertPayload,
} from '@/interface/tour';
import type { TourAvailabilityItem } from '@/interface/tour-booking';

export const getTours = (params?: TourQueryParams): Promise<TourPaginatedResponse> => {
  return api.get<TourPaginatedResponse>('/api/v1/public/tours', { params });
};

export const getTour = (id: string): Promise<Tour> => {
  return api.get<Tour>(`/api/v1/public/tours/${id}`);
};

export const getTourBySlug = (slug: string): Promise<Tour> => {
  return api.get<Tour>(`/api/v1/public/tours/slug/${slug}`);
};

export const getTourOptions = (params?: { destinationId?: string }): Promise<TourOption[]> => {
  return api.get<TourOption[]>('/api/v1/public/tours/options', { params });
};

export const getFeaturedTours = (params?: { limit?: number }): Promise<Tour[]> => {
  return api.get<Tour[]>('/api/v1/public/tours/featured', { params });
};

/** Tạo tour: FormData (có gallery) hoặc JSON. Gửi FormData thì không set Content-Type để axios tự thêm boundary. */
export const createTour = (data: TourUpsertPayload | FormData): Promise<Tour> => {
  if (data instanceof FormData) {
    return api.post<Tour>('/api/v1/admin/tours', data, {
      headers: { 'Content-Type': undefined } as unknown as Record<string, string>,
    });
  }
  return api.post<Tour, TourUpsertPayload>('/api/v1/admin/tours', data);
};

/** Cập nhật tour: FormData (có gallery) hoặc JSON. Gửi FormData thì không set Content-Type. */
export const updateTour = (
  id: string,
  data: Partial<TourUpsertPayload> | FormData
): Promise<Tour> => {
  if (data instanceof FormData) {
    return api.patch<Tour>(`/api/v1/admin/tours/${id}`, data, {
      headers: { 'Content-Type': undefined } as unknown as Record<string, string>,
    });
  }
  return api.patch<Tour, Partial<TourUpsertPayload>>(`/api/v1/admin/tours/${id}`, data);
};

export const deleteTour = (id: string): Promise<{ success: boolean } | unknown> => {
  return api.delete(`/api/v1/admin/tours/${id}`);
};

/** Phase 2: Availability by month (YYYY-MM) */
export const getTourAvailability = (
  tourId: string,
  month?: string
): Promise<TourAvailabilityItem[]> => {
  return api.get<TourAvailabilityItem[]>(
    `/api/v1/public/tour-inventory/tours/${tourId}/availability`,
    {
    params: month ? { month } : undefined,
    },
  );
};
