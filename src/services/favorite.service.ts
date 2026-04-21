import api from '@/lib/axios';

export type FavoriteEntityType = 'TOUR' | 'ROOM' | 'HOTEL' | 'GUIDE';

export type Favorite = {
  _id: string;
  userId: string;
  entityType: FavoriteEntityType;
  entityId: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminFavoritesListResponse = {
  data: Favorite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

export type GetAdminFavoritesParams = {
  userId?: string;
  entityType?: FavoriteEntityType;
  entityId?: string;
  page: number;
  limit: number;
};

export const getAdminFavorites = (params: GetAdminFavoritesParams) =>
  api.get<AdminFavoritesListResponse>('/api/v1/favorites/admin', { params });

