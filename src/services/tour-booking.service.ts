import api from '@/lib/axios';
import type {
  TourBooking,
  TourBookingListResponse,
  TourBookingPaymentPayload,
  TourBookingCancelPayload,
  TourBookingStatus,
} from '@/interface/tour-booking';

export type AdminTourBookingParams = {
  page?: number;
  limit?: number;
  status?: TourBookingStatus;
};

export const getAdminTourBookings = (
  params?: AdminTourBookingParams
): Promise<TourBookingListResponse> => {
  return api.get<TourBookingListResponse>('/api/v1/tour-bookings/admin', {
    params,
  });
};

export const getTourBookingById = (id: string): Promise<TourBooking> => {
  return api.get<TourBooking>(`/api/v1/tour-bookings/${id}`);
};

export const confirmTourBooking = (id: string): Promise<TourBooking> => {
  return api.patch<TourBooking>(`/api/v1/tour-bookings/${id}/confirm`);
};

export const cancelTourBooking = (
  id: string,
  body?: TourBookingCancelPayload
): Promise<TourBooking> => {
  return api.patch<TourBooking, TourBookingCancelPayload>(
    `/api/v1/tour-bookings/${id}/cancel`,
    body ?? {}
  );
};

export const recordTourBookingPayment = (
  id: string,
  body: TourBookingPaymentPayload
): Promise<TourBooking> => {
  return api.post<TourBooking, TourBookingPaymentPayload>(
    `/api/v1/tour-bookings/${id}/payment`,
    body
  );
};
