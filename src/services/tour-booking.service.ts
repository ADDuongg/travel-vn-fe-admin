import api from '@/lib/axios';
import type {
  TourBooking,
  TourBookingListResponse,
  TourBookingPaymentPayload,
  TourBookingCancelPayload,
  TourBookingStatus,
} from '@/interface/tour-booking';

/** FE Admin tour bookings — docs/MODULES-9-11-FE-API.md */

export type AdminTourBookingParams = {
  page?: number;
  limit?: number;
  status?: TourBookingStatus;
};

export const getAdminTourBookings = (
  params?: AdminTourBookingParams,
): Promise<TourBookingListResponse> => {
  return api.get<TourBookingListResponse>('/api/v1/admin/tour-bookings', {
    params,
  });
};

export const getTourBookingById = (id: string): Promise<TourBooking> => {
  return api.get<TourBooking>(`/api/v1/admin/tour-bookings/${id}`);
};

export const confirmTourBooking = (id: string): Promise<TourBooking> => {
  return api.patch<TourBooking>(`/api/v1/admin/tour-bookings/${id}/confirm`);
};

/** Owner flow on BE; admin UI calls with staff JWT per product policy. */
export const cancelTourBooking = (
  id: string,
  body?: TourBookingCancelPayload,
): Promise<TourBooking> => {
  return api.patch<TourBooking, TourBookingCancelPayload>(
    `/api/v1/client/tour-bookings/${id}/cancel`,
    body ?? {},
  );
};

export const recordTourBookingPayment = (
  id: string,
  body: TourBookingPaymentPayload,
): Promise<TourBooking> => {
  return api.post<TourBooking, TourBookingPaymentPayload>(
    `/api/v1/admin/tour-bookings/${id}/payment`,
    body,
  );
};

export const assignTourBookingGuide = (
  id: string,
  guideId: string,
): Promise<TourBooking> => {
  return api.patch<TourBooking, { guideId: string }>(
    `/api/v1/admin/tour-bookings/${id}/assign-guide`,
    { guideId },
  );
};
