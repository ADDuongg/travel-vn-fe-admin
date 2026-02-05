import api from '@/lib/axios';
import type {
  Tour,
  TourOption,
  TourPaginatedResponse,
  TourQueryParams,
  TourUpsertPayload,
} from '@/interface/tour';

export const getTours = (params?: TourQueryParams): Promise<TourPaginatedResponse> => {
  return api.get<TourPaginatedResponse>('/api/v1/tours', { params });
};

export const getTour = (id: string): Promise<Tour> => {
  return api.get<Tour>(`/api/v1/tours/${id}`);
};

export const getTourBySlug = (slug: string): Promise<Tour> => {
  return api.get<Tour>(`/api/v1/tours/slug/${slug}`);
};

export const getTourOptions = (params?: { destinationId?: string }): Promise<TourOption[]> => {
  return api.get<TourOption[]>('/api/v1/tours/options', { params });
};

export const getFeaturedTours = (params?: { limit?: number }): Promise<Tour[]> => {
  return api.get<Tour[]>('/api/v1/tours/featured', { params });
};

export const createTour = (data: TourUpsertPayload): Promise<Tour> => {
  return api.post<Tour, TourUpsertPayload>('/api/v1/tours', data);
};

export const updateTour = (id: string, data: Partial<TourUpsertPayload>): Promise<Tour> => {
  return api.patch<Tour, Partial<TourUpsertPayload>>(`/api/v1/tours/${id}`, data);
};

export const deleteTour = (id: string): Promise<{ success: boolean } | unknown> => {
  return api.delete(`/api/v1/tours/${id}`);
};
