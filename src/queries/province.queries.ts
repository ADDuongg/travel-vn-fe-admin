import { useQuery } from '@tanstack/react-query';
import { getProvinces } from '@/services/province.service';

export const PROVINCE_QUERY_KEY = ['provinces'];

export const useProvinces = () =>
  useQuery({
    queryKey: PROVINCE_QUERY_KEY,
    queryFn: getProvinces,
    staleTime: 10 * 60 * 1000,
  });
