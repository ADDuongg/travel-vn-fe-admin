import type { Amenity } from './commons';
import type { Province } from './province';

export type TourType = 'DOMESTIC' | 'INTERNATIONAL' | 'DAILY';
export type TourDifficulty = 'EASY' | 'MODERATE' | 'CHALLENGING' | 'DIFFICULT';
export type TourSaleType = 'PERCENT' | 'FIXED';

export type TourTranslation = {
  name: string;
  description?: string;
  shortDescription?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  notes?: string[];
  cancellationPolicy?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
};

export type TourItineraryDayTranslation = {
  title: string;
  description: string;
  meals?: string[];
  accommodation?: string;
};

export type TourImage = {
  url: string;
  publicId?: string;
  alt?: string;
  order?: number;
};

export type TourDestination = {
  provinceId: string | Province;
  isMainDestination: boolean;
};

export type TourItineraryDay = {
  dayNumber: number;
  translations: Record<string, TourItineraryDayTranslation>;
};

export interface Tour {
  _id: string;
  slug: string;
  code: string;
  isActive: boolean;

  tourType: TourType;
  duration: { days: number; nights: number };

  destinations: TourDestination[];
  departureProvinceId: string | Province;

  translations: Record<string, TourTranslation>;
  itinerary: TourItineraryDay[];

  capacity: { minGuests: number; maxGuests: number; privateAvailable: boolean };

  pricing: {
    basePrice: number;
    currency: string;
    childPrice?: number;
    infantPrice?: number;
    singleSupplement?: number;
  };

  contact?: {
    phone?: string;
    email?: string;
    hotline?: string;
  };

  thumbnail?: TourImage;
  gallery?: TourImage[];

  amenities?: string[] | Amenity[];
  transportTypes?: string[];

  bookingConfig: {
    advanceBookingDays: number;
    allowInstantBooking: boolean;
    requireDeposit: boolean;
    depositPercent: number;
  };

  sale?: {
    isActive: boolean;
    type: TourSaleType;
    value: number;
    startDate?: string;
    endDate?: string;
  };

  ratingSummary?: { average: number; total: number };

  schedule?: {
    departureDays?: string[];
    fixedDepartures?: Array<{
      date: string;
      availableSlots: number;
      status: string;
    }>;
  };

  difficulty?: TourDifficulty;
  createdAt: string;
  updatedAt: string;
}

export type TourOption = Pick<
  Tour,
  '_id' | 'slug' | 'code' | 'translations' | 'duration' | 'pricing'
>;

export interface TourQueryParams {
  page?: number;
  limit?: number;
  destinationId?: string;
  departureProvinceId?: string;
  tourType?: TourType;
  minDays?: number;
  maxDays?: number;
  minPrice?: number;
  maxPrice?: number;
  difficulty?: TourDifficulty;
  sortBy?:
    | 'price_asc'
    | 'price_desc'
    | 'duration_asc'
    | 'duration_desc'
    | 'rating'
    | 'newest';
  search?: string;
  transportTypes?: string; // comma-separated per API docs
}

export interface TourPaginatedResponse {
  items: Tour[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type TourUpsertPayload = Omit<Tour, '_id' | 'createdAt' | 'updatedAt'> & {
  _id?: string;
};
