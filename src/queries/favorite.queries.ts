import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getAdminFavorites,
  type GetAdminFavoritesParams,
} from '@/services/favorite.service';

export const ADMIN_FAVORITES_QUERY_KEY = ['admin-favorites'];

export const useAdminFavorites = (params: GetAdminFavoritesParams) =>
  useQuery({
    queryKey: [...ADMIN_FAVORITES_QUERY_KEY, params],
    queryFn: () => getAdminFavorites(params),
    placeholderData: keepPreviousData,
  });

