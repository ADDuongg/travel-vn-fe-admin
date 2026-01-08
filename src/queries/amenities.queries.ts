// queries/amenities.ts
import {
  createAmenity,
  deleteAmenity,
  getAmenities,
  updateAmenity,
} from '@/services/amenities.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const AMENITIES_KEY = ['amenities'];

export const useAmenities = () =>
  useQuery({
    queryKey: AMENITIES_KEY,
    queryFn: getAmenities,
  });

export const useCreateAmenity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAmenity,
    onSuccess: () => qc.invalidateQueries({ queryKey: AMENITIES_KEY }),
  });
};

export const useUpdateAmenity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateAmenity(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: AMENITIES_KEY }),
  });
};

export const useDeleteAmenity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAmenity,
    onSuccess: () => qc.invalidateQueries({ queryKey: AMENITIES_KEY }),
  });
};
