import api from '@/lib/axios';
import type {
  Province,
  ProvinceDetail,
  ProvinceListResponse,
  ProvinceMetadataUpdatePayload,
  ProvinceQueryParams,
} from '@/interface/province';

/** Reads: docs/MODULES-1-4-FE-API.md §1.1. Mutations: §1.2 (/api/v1/admin/...). */

export const getProvinceDropdown = (): Promise<Province[]> =>
  api.get<Province[]>('/api/v1/public/provinces/dropdown');

export const getProvinces = (
  params?: ProvinceQueryParams,
): Promise<ProvinceListResponse> =>
  api.get<ProvinceListResponse>('/api/v1/public/provinces', { params });

export const getProvinceBySlug = (slug: string): Promise<ProvinceDetail> =>
  api.get<ProvinceDetail>(
    `/api/v1/public/provinces/${encodeURIComponent(slug)}`,
  );

export const updateProvinceMetadata = (
  id: string,
  payload: ProvinceMetadataUpdatePayload,
): Promise<ProvinceDetail> =>
  api.patch<ProvinceDetail, ProvinceMetadataUpdatePayload>(
    `/api/v1/admin/provinces/${id}`,
    payload,
  );

export const toggleProvincePopular = (id: string): Promise<ProvinceDetail> =>
  api.patch<ProvinceDetail>(
    `/api/v1/admin/provinces/${id}/toggle-popular`,
  );

export const softDeleteProvince = (
  id: string,
): Promise<{ message: string } | unknown> =>
  api.delete(`/api/v1/admin/provinces/${id}`);

export const restoreProvince = (id: string): Promise<{ message: string }> =>
  api.patch<{ message: string }>(`/api/v1/admin/provinces/${id}/restore`);
