import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ProvinceDetail,
  ProvinceListResponse,
  ProvinceMetadataUpdatePayload,
  ProvinceQueryParams,
} from '@/interface/province';
import {
  getProvinceDropdown,
  getProvinceBySlug,
  getProvinces,
  restoreProvince,
  softDeleteProvince,
  toggleProvincePopular,
  updateProvinceMetadata,
} from '@/services/province.service';

export const PROVINCE_KEYS = {
  all: ['provinces'] as const,
  list: (params?: ProvinceQueryParams) => ['provinces', params] as const,
  detail: (slug: string) => ['provinces', 'slug', slug] as const,
  dropdown: ['provinces', 'dropdown'] as const,
};

export const useProvinceDropdown = () =>
  useQuery({
    queryKey: PROVINCE_KEYS.dropdown,
    queryFn: () => getProvinceDropdown(),
    staleTime: 10 * 60 * 1000,
  });

export const useProvinces = (params?: ProvinceQueryParams) =>
  useQuery<ProvinceListResponse>({
    queryKey: PROVINCE_KEYS.list(params),
    queryFn: () => getProvinces(params),
    staleTime: 10 * 60 * 1000,
  });

export const useProvince = (slug?: string) =>
  useQuery<ProvinceDetail>({
    queryKey: slug ? PROVINCE_KEYS.detail(slug) : [],
    queryFn: () => getProvinceBySlug(slug!),
    enabled: !!slug,
  });

export const useUpdateProvinceMetadata = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ProvinceMetadataUpdatePayload | FormData;
    }) => updateProvinceMetadata(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: PROVINCE_KEYS.all });
      if (data.slug) {
        qc.invalidateQueries({ queryKey: PROVINCE_KEYS.detail(data.slug) });
      }
    },
  });
};

export const useToggleProvincePopular = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleProvincePopular(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: PROVINCE_KEYS.all });
      if (data.slug) {
        qc.invalidateQueries({ queryKey: PROVINCE_KEYS.detail(data.slug) });
      }
    },
  });
};

export const useSoftDeleteProvince = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteProvince(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROVINCE_KEYS.all });
    },
  });
};

export const useRestoreProvince = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreProvince(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROVINCE_KEYS.all });
    },
  });
};
