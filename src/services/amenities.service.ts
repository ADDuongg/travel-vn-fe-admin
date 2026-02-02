// services/amenities.ts
import api from '@/lib/axios';
import type { Amenity } from '@interface/commons';

export type AmenityPayload = {
  /** Unique code for filtering (e.g. wifi, air_condition, pool) */
  code?: string;
  translations: {
    [langCode: string]: {
      name: string;
      description?: string;
    };
  };
  isActive?: boolean;
  icon?: File | null;
};

export const getAmenities = () => api.get<Amenity[]>('/api/v1/amenities');

export const createAmenity = (data: AmenityPayload) => {
  const form = new FormData();

  if (data.code) {
    form.append('code', data.code);
  }

  form.append('translations', JSON.stringify(data.translations));

  if (typeof data.isActive === 'boolean') {
    form.append('isActive', String(data.isActive));
  }

  if (data.icon instanceof File) {
    form.append('icon', data.icon);
  }

  return api.post('/api/v1/amenities', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateAmenity = (id: string, data: AmenityPayload) => {
  const form = new FormData();

  if (data.code !== undefined) {
    form.append('code', data.code);
  }

  if (data.translations) {
    form.append('translations', JSON.stringify(data.translations));
  }

  if (typeof data.isActive === 'boolean') {
    form.append('isActive', String(data.isActive));
  }

  if (data.icon instanceof File) {
    form.append('icon', data.icon);
  }

  if (data.icon === null) {
    form.append('removeIcon', 'true');
  }

  return api.patch(`/api/v1/amenities/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteAmenity = (id: string) =>
  api.delete(`/api/v1/amenities/${id}`);
