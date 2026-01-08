// services/amenities.ts
import api from '@/lib/axios';
import type { Amenity } from '@interface/commons';

type AmenityPayload = {
  name?: string;
  isActive?: boolean;
  icon?: File | null;
};

export const getAmenities = () => api.get<Amenity[]>('/api/v1/amenities');

/* ===== CREATE ===== */
export const createAmenity = (data: { name: string; icon?: File | null }) => {
  const form = new FormData();

  form.append('name', data.name);

  if (data.icon instanceof File) {
    form.append('icon', data.icon);
  }

  return api.post('/api/v1/amenities', form);
};

/* ===== UPDATE ===== */
export const updateAmenity = (id: string, data: AmenityPayload) => {
  const form = new FormData();

  if (data.name !== undefined) {
    form.append('name', data.name);
  }

  if (typeof data.isActive === 'boolean') {
    form.append('isActive', String(data.isActive));
  }

  // ✅ replace icon
  if (data.icon instanceof File) {
    form.append('icon', data.icon);
  }

  // ✅ explicit remove icon
  if (data.icon === null) {
    form.append('removeIcon', 'true');
  }

  return api.patch(`/api/v1/amenities/${id}`, form);
};

/* ===== DELETE ===== */
export const deleteAmenity = (id: string) =>
  api.delete(`/api/v1/amenities/${id}`);
