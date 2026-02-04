import api from '@/lib/axios';
import type { Room, RoomListResponse } from '@interface/room';

export type GetRoomsParams = {
  provinceId?: string;
  hotelIds?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  keyword?: string;
  lang?: string;
  minPrice?: number;
  maxPrice?: number;
  adults?: number;
  children?: number;
  checkIn?: string;
  checkOut?: string;
  minRating?: number;
  amenities?: string[];
  roomSize?: number;
};

export const getRooms = (params?: GetRoomsParams): Promise<RoomListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.provinceId) searchParams.set('provinceId', params.provinceId);
  if (params?.hotelIds?.length)
    params.hotelIds.forEach((id) => searchParams.append('hotelIds', id));
  if (params?.page != null) searchParams.set('page', String(params.page));
  if (params?.limit != null) searchParams.set('limit', String(params.limit));
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.keyword) searchParams.set('keyword', params.keyword);
  if (params?.lang) searchParams.set('lang', params.lang);
  if (params?.minPrice != null) searchParams.set('minPrice', String(params.minPrice));
  if (params?.maxPrice != null) searchParams.set('maxPrice', String(params.maxPrice));
  if (params?.adults != null) searchParams.set('adults', String(params.adults));
  if (params?.children != null) searchParams.set('children', String(params.children));
  if (params?.checkIn) searchParams.set('checkIn', params.checkIn);
  if (params?.checkOut) searchParams.set('checkOut', params.checkOut);
  if (params?.minRating != null) searchParams.set('minRating', String(params.minRating));
  if (params?.roomSize != null) searchParams.set('roomSize', String(params.roomSize));
  if (params?.amenities?.length)
    params.amenities.forEach((a) => searchParams.append('amenities', a));

  const query = searchParams.toString();
  return api.get<RoomListResponse>(
    query ? `/api/v1/rooms?${query}` : '/api/v1/rooms',
  );
};

export const getRoom = (id: string): Promise<Room> => {
  return api.get<Room>(`/api/v1/rooms/${id}`);
};

export const createRoom = (data: FormData): Promise<Room> => {
  return api.post<Room>('/api/v1/rooms', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateRoom = (id: string, data: FormData): Promise<Room> => {
  return api.patch<Room>(`/api/v1/rooms/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteRoom = (id: string): Promise<boolean> => {
  return api.delete<boolean>(`/api/v1/rooms/${id}`);
};
