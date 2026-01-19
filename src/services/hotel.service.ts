import api from '@/lib/axios';

export type HotelOption = {
  _id: string;
  name: string;
};

export const getHotelsOption = () =>
  api.get<HotelOption[]>('/api/v1/hotels/options');
