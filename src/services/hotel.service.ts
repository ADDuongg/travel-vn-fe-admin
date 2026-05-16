import api from '@/lib/axios';
import type {
  Hotel,
  HotelCreateUpdateBody,
  HotelListResponse,
  HotelOption,
} from '@/interface/hotel';

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

export const createHotel = (data: HotelCreateUpdateBody): Promise<Hotel> => {
  return api.post<Hotel, HotelCreateUpdateBody>('/api/v1/admin/hotels', data);
};

export const updateHotel = (
  id: string,
  data: Partial<HotelCreateUpdateBody>,
): Promise<Hotel> => {
  return api.patch<Hotel, Partial<HotelCreateUpdateBody>>(
    `/api/v1/admin/hotels/${id}`,
    data,
  );
};

export const deleteHotel = (id: string): Promise<boolean> => {
  return api.delete<boolean>(`/api/v1/admin/hotels/${id}`);
};
