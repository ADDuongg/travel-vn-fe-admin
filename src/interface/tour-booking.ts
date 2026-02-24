/**
 * Phase 2 - Tour Booking & Inventory (FE-API-TOUR-PHASE2)
 */

export type TourAvailabilityStatus =
  | 'AVAILABLE'
  | 'LIMITED'  // ≤20% slots
  | 'FULL'
  | 'CANCELLED';

export type TourBookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAID'
  | 'CANCELLED'
  | 'COMPLETED';

export interface TourAvailabilityItem {
  departureDate: string;
  availableSlots: number;
  totalSlots: number;
  status: TourAvailabilityStatus;
  specialPrice: number | null;
  currency: string;
}

export interface TourInventoryEnsurePayload {
  tourId: string;
  departureDate: string; // YYYY-MM-DD
  totalSlots: number;
  specialPrice?: number;
}

export interface TourInventoryDocument {
  _id: string;
  tourId: string;
  departureDate: string;
  totalSlots: number;
  availableSlots: number;
  status: TourAvailabilityStatus;
  specialPrice?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TourBookingGuest {
  fullName: string;
  email: string;
  phone?: string;
  note?: string;
}

export interface TourBookingTourInfo {
  _id: string;
  code?: string;
  slug?: string;
  translations?: Record<string, { name?: string }>;
  duration?: { days: number; nights: number };
  pricing?: {
    basePrice: number;
    currency: string;
    childPrice?: number;
    infantPrice?: number;
  };
}

export interface TourBookingInventoryInfo {
  _id: string;
  departureDate: string;
  totalSlots?: number;
  availableSlots?: number;
  specialPrice?: number;
}

export interface TourBooking {
  _id: string;
  bookingCode: string;
  tourId: string | TourBookingTourInfo;
  tourInventoryId?: string | TourBookingInventoryInfo;
  guest: TourBookingGuest;
  adults: number;
  children: number;
  infants: number;
  departureDate: string;
  totalAmount: number;
  currency: string;
  depositAmount: number;
  paidAmount: number;
  status: TourBookingStatus;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
  paidAt?: string;
  userId?: string;
}

export interface TourBookingListResponse {
  items: TourBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TourBookingPaymentPayload {
  amount: number;
  provider?: string; // BANK_TRANSFER | VNPay | Momo | CASH | ...
  transactionId?: string;
}

export interface TourBookingCancelPayload {
  reason?: string;
}
