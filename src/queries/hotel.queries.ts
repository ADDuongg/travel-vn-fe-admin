import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { HotelCreateUpdateBody } from '@/interface/hotel';
import {
  getHotels,
  getHotelOptions,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
} from '@/services/hotel.service';
import type { GetHotelsParams, GetHotelOptionsParams } from '@/services/hotel.service';

export const HOTEL_KEYS = {
  all: ['hotels'] as const,
  list: (params?: GetHotelsParams) => ['hotels', params] as const,
  options: (params?: GetHotelOptionsParams) => ['hotels', 'options', params] as const,
  detail: (id: string) => ['hotels', id] as const,
};

export const useHotels = (params?: GetHotelsParams) =>
  useQuery({
    queryKey: HOTEL_KEYS.list(params),
    queryFn: () => getHotels(params),
  });

export const useHotelOptions = (params?: GetHotelOptionsParams) =>
  useQuery({
    queryKey: HOTEL_KEYS.options(params),
    queryFn: () => getHotelOptions(params),
    staleTime: 5 * 60 * 1000,
  });

export const useHotel = (id?: string) =>
  useQuery({
    queryKey: id ? HOTEL_KEYS.detail(id) : [],
    queryFn: () => getHotel(id!),
    enabled: !!id,
  });

export const useCreateHotel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createHotel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOTEL_KEYS.all });
    },
  });
};

export const useUpdateHotel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<HotelCreateUpdateBody>;
    }) => updateHotel(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: HOTEL_KEYS.all });
      qc.invalidateQueries({ queryKey: HOTEL_KEYS.detail(id) });
    },
  });
};

export const useDeleteHotel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteHotel,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: HOTEL_KEYS.all });
      qc.invalidateQueries({ queryKey: HOTEL_KEYS.detail(id) });
    },
  });
};
