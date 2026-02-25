import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { AdminTourBookingParams } from '@/services/tour-booking.service';
import type {
  TourBookingCancelPayload,
  TourBookingPaymentPayload,
} from '@/interface/tour-booking';
import {
  getAdminTourBookings,
  getTourBookingById,
  confirmTourBooking,
  cancelTourBooking,
  recordTourBookingPayment,
  assignTourBookingGuide,
} from '@/services/tour-booking.service';

export const TOUR_BOOKING_KEYS = {
  all: ['tour-bookings'] as const,
  adminList: (params?: AdminTourBookingParams) =>
    ['tour-bookings', 'admin', params] as const,
  detail: (id: string) => ['tour-bookings', id] as const,
};

export const useAdminTourBookings = (params?: AdminTourBookingParams) =>
  useQuery({
    queryKey: TOUR_BOOKING_KEYS.adminList(params),
    queryFn: () => getAdminTourBookings(params),
    placeholderData: keepPreviousData,
  });

export const useTourBooking = (id?: string) =>
  useQuery({
    queryKey: id ? TOUR_BOOKING_KEYS.detail(id) : [],
    queryFn: () => getTourBookingById(id!),
    enabled: !!id,
  });

export const useConfirmTourBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: confirmTourBooking,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: TOUR_BOOKING_KEYS.all });
      qc.invalidateQueries({ queryKey: TOUR_BOOKING_KEYS.detail(data._id) });
    },
  });
};

export const useCancelTourBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & TourBookingCancelPayload) =>
      cancelTourBooking(id, body.reason ? { reason: body.reason } : undefined),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: TOUR_BOOKING_KEYS.all });
      qc.invalidateQueries({ queryKey: TOUR_BOOKING_KEYS.detail(data._id) });
    },
  });
};

export const useRecordTourBookingPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: { id: string } & TourBookingPaymentPayload) =>
      recordTourBookingPayment(id, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: TOUR_BOOKING_KEYS.all });
      qc.invalidateQueries({ queryKey: TOUR_BOOKING_KEYS.detail(data._id) });
    },
  });
};

export const useAssignTourBookingGuide = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, guideId }: { id: string; guideId: string }) =>
      assignTourBookingGuide(id, guideId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: TOUR_BOOKING_KEYS.all });
      qc.invalidateQueries({ queryKey: TOUR_BOOKING_KEYS.detail(data._id) });
    },
  });
};
