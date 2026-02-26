import api from '@/lib/axios';
import type {
  Province,
  ProvinceDetail,
  ProvinceListResponse,
  ProvinceMetadataUpdatePayload,
  ProvinceQueryParams,
} from '@/interface/province';

export const getProvinceDropdown = (): Promise<Province[]> =>
  api.get<Province[]>('/api/v1/provinces/dropdown');

export const getProvinces = (
  params?: ProvinceQueryParams,
): Promise<ProvinceListResponse> =>
  api.get<ProvinceListResponse>('/api/v1/provinces', { params });

export const getProvinceBySlug = (slug: string): Promise<ProvinceDetail> =>
  api.get<ProvinceDetail>(`/api/v1/provinces/${slug}`);

export const updateProvinceMetadata = (
  id: string,
  payload: ProvinceMetadataUpdatePayload | FormData,
): Promise<ProvinceDetail> => {
  if (payload instanceof FormData) {
    return api.patch<ProvinceDetail>(`/api/v1/provinces/${id}`, payload, {
      headers: { 'Content-Type': undefined } as unknown as Record<
        string,
        string
      >,
    });
  }
  return api.patch<ProvinceDetail, ProvinceMetadataUpdatePayload>(
    `/api/v1/provinces/${id}`,
    payload,
  );
};

export const toggleProvincePopular = (id: string): Promise<ProvinceDetail> =>
  api.patch<ProvinceDetail>(`/api/v1/provinces/${id}/toggle-popular`);

export const softDeleteProvince = (
  id: string,
): Promise<{ message: string } | unknown> =>
  api.delete(`/api/v1/provinces/${id}`);

export const restoreProvince = (id: string): Promise<{ message: string }> =>
  api.patch<{ message: string }>(`/api/v1/provinces/${id}/restore`);
