import api from '@/lib/axios';
import type { Hotel, HotelListResponse, HotelOption } from '@/interface/hotel';

export type GetHotelsParams = {
  provinceId?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
};
export type GetHotelOptionsParams = { provinceId?: string };

export const getHotels = (params?: GetHotelsParams): Promise<HotelListResponse> => {
  const normalizedParams = params
    ? {
        ...params,
        limit: params.limit ?? params.pageSize,
      }
    : undefined;
  return api.get<HotelListResponse>('/api/v1/public/hotels', {
    params: normalizedParams,
  });
};

export const getHotelOptions = (
  params?: GetHotelOptionsParams,
): Promise<HotelOption[]> => {
  return api.get<HotelOption[]>('/api/v1/public/hotels/options', { params });
};

export const getHotel = (id: string): Promise<Hotel> => {
  return api.get<Hotel>(`/api/v1/public/hotels/${id}`);
};

export const createHotel = (data: FormData): Promise<Hotel> => {
  return api.post<Hotel>('/api/v1/admin/hotels', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateHotel = (id: string, data: FormData): Promise<Hotel> => {
  return api.patch<Hotel>(`/api/v1/admin/hotels/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
