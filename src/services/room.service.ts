import api from '@/lib/axios';
import type { Room, RoomListResponse } from '@interface/room';

export const getRooms = (): Promise<RoomListResponse> => {
  return api.get('/api/v1/rooms');
};

export const getRoom = (id: string): Promise<Room> => {
  return api.get(`/api/v1/rooms/${id}`);
};

export const createRoom = (data: FormData): Promise<Room> => {
  return api.post('/api/v1/rooms', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateRoom = (id: string, data: FormData): Promise<Room> => {
  return api.patch(`/api/v1/rooms/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteRoom = (id: string): Promise<boolean> => {
  return api.delete(`/api/v1/rooms/${id}`);
};
