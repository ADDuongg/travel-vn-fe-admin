import { getHotelsOption } from '@/services/hotel.service';
import { useQuery } from '@tanstack/react-query';

export const HOTEL_OPTIONS_QUERY_KEY = ['hotel-options'];

export const useHotelOptions = () => {
  return useQuery({
    queryKey: HOTEL_OPTIONS_QUERY_KEY,
    queryFn: getHotelsOption,
    staleTime: 5 * 60 * 1000,
  });
};
