import api from '@/lib/axios';
import type { Hotel, HotelOption } from '@/interface/hotel';

export type GetHotelsParams = { provinceId?: string };
export type GetHotelOptionsParams = { provinceId?: string };

export const getHotels = (params?: GetHotelsParams): Promise<HotelOption[]> => {
  return api.get<HotelOption[]>('/api/v1/hotels', { params });
};

export const getHotelOptions = (
  params?: GetHotelOptionsParams,
): Promise<HotelOption[]> => {
  return api.get<HotelOption[]>('/api/v1/hotels/options', { params });
};

export const getHotel = (id: string): Promise<Hotel> => {
  return api.get<Hotel>(`/api/v1/hotels/${id}`);
};

export const createHotel = (data: FormData): Promise<Hotel> => {
  return api.post<Hotel>('/api/v1/hotels', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateHotel = (id: string, data: FormData): Promise<Hotel> => {
  return api.patch<Hotel>(`/api/v1/hotels/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
