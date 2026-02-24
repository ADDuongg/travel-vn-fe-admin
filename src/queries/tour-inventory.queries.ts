import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ensureTourInventory } from '@/services/tour-inventory.service';
import type { TourInventoryEnsurePayload } from '@/interface/tour-booking';
import { TOUR_KEYS } from '@/queries/tour.queries';

export const TOUR_INVENTORY_KEYS = ['tour-inventory'] as const;

export const useEnsureTourInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TourInventoryEnsurePayload) => ensureTourInventory(payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: TOUR_INVENTORY_KEYS });
      qc.invalidateQueries({ queryKey: TOUR_KEYS.availability(variables.tourId) });
      qc.invalidateQueries({ queryKey: TOUR_KEYS.detail(variables.tourId) });
    },
  });
};
