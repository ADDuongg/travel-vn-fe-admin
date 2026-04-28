import api from '@/lib/axios';

/** FE Admin + client cancel — docs/MODULES-9-11-FE-API.md */

export type BookingType = 'ROOM' | 'TOUR';
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'ALL';
export type BookingPaymentStatus =
  | 'UNPAID'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'EXPIRED';

export type AdminBooking = {
  _id: string;
  bookingType: BookingType;
  status: BookingStatus;
  paymentStatus: BookingPaymentStatus;
  amount: number;
  currency: string;
  rooms: Array<{
    room?: {
      _id: string;
      name?: string;
      slug?: string;
      thumbnail?: { url: string; alt?: string };
      category?: string;
      capacity?: {
        baseAdults: number;
        baseChildren: number;
        maxAdults: number;
        maxChildren: number;
      };
      pricing?: {
        basePrice: number;
        currency: string;
        weekendPrice?: number;
        extraAdultPrice?: number;
        extraChildPrice?: number;
      };
      sale?: {
        isActive: boolean;
        type: 'PERCENT' | 'FIXED';
        value: number;
        startDate?: string;
        endDate?: string;
      };
    };
    checkIn: string;
    checkOut: string;
    guests: { adults: number; children: number };
  }>;
  user?: {
    _id: string;
    email?: string;
    name?: string;
  };
  bankReceipt?: {
    url: string;
    uploadedAt: string;
    verified: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type AdminBookingListResponse = {
  data: AdminBooking[];
  meta: {
    pageIndex: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
};

export const getAdminBookings = (params: {
  pageIndex: number;
  pageSize: number;
  bookingType?: BookingType;
  status?: BookingStatus;
  paymentStatus?: BookingPaymentStatus;
  q?: string;
}) =>
  api.get<AdminBookingListResponse>('/api/v1/admin/bookings', {
    params: {
      bookingType: params.bookingType ?? 'ROOM',
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      status: params.status,
      paymentStatus: params.paymentStatus,
      q: params.q,
    },
  });

export const getAdminBookingById = (id: string) =>
  api.get<AdminBooking>(`/api/v1/admin/bookings/${id}`);

export const markBookingPaid = (id: string) =>
  api.patch(`/api/v1/admin/bookings/${id}/mark-paid`);

/** Owner flow on BE; admin UI calls with staff JWT per product policy. */
export const cancelBooking = (id: string) =>
  api.patch(`/api/v1/client/bookings/${id}/cancel`);

export const refundBooking = (id: string, fullyRefunded = true) =>
  api.patch(`/api/v1/admin/bookings/${id}/refund`, { fullyRefunded });
