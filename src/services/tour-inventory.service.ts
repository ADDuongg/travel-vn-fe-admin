import api from '@/lib/axios';
import type {
  TourInventoryEnsurePayload,
  TourInventoryDocument,
} from '@/interface/tour-booking';

/**
 * Phase 2 - Admin: Create or update inventory for a departure date.
 * Requires Bearer token.
 */
export const ensureTourInventory = (
  payload: TourInventoryEnsurePayload
): Promise<TourInventoryDocument> => {
  return api.post<TourInventoryDocument, TourInventoryEnsurePayload>(
    '/api/v1/tour-inventory/ensure',
    payload
  );
};
