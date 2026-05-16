export type RoomImage = {
  url: string;
  publicId?: string;
  alt?: string;
  order?: number;
};

/** Admin create/update body — see docs/FE-ROOMS-ADMIN.md */
export type RoomPayloadCapacity = {
  baseAdults: number;
  baseChildren?: number;
  maxAdults: number;
  maxChildren?: number;
  roomSize?: number;
};

export type RoomPayloadTranslation = {
  name: string;
  description: string;
  shortDescription?: string;
  hotelRule?: string[];
  faq?: { question: string; answer: string }[];
};

export type RoomPayloadSale = {
  isActive: boolean;
  type: 'PERCENT' | 'FIXED';
  value: number;
  startDate?: string;
  endDate?: string;
};

export type RoomPayload = {
  code: string;
  slug: string;
  roomType: string;
  isActive: boolean;
  hotelId: string;
  capacity: RoomPayloadCapacity;
  basePrice: number;
  currency?: string;
  totalRooms: number;
  translations: Record<string, RoomPayloadTranslation>;
  bookingConfig: {
    minNights: number;
    maxNights?: number;
    allowInstantBooking: boolean;
  };
  amenities?: Array<string | { code: string; icon?: string }>;
  sale?: RoomPayloadSale;
  thumbnail?: {
    url: string;
    publicId?: string;
    alt?: string;
  };
  gallery?: Array<{
    url: string;
    publicId?: string;
    alt?: string;
    order?: number;
  }>;
};

export type RoomTranslation = {
  name: string;
  description: string;
  shortDescription?: string;
  hotelRule?: string[];
  faq: {
    question: string;
    answer: string;
  }[];
};

export type AmenityTranslation = {
  name: string;
  description?: string;
};

export type RoomAmenitity = {
  name: string;
  description: string;
};

export type RoomSale = {
  isActive: boolean;
  type?: 'PERCENT' | 'FIXED';
  value?: number;
};

export interface Room {
  _id: string;

  code: string;
  slug: string;
  roomType: string; // e.g., "Master", "Deluxe"
  isActive: boolean;

  /* ===== capacity (legacy flat + nested from BE) ===== */
  maxGuests: number;
  adults: number;
  children?: number;
  roomSize?: number;
  capacity?: RoomPayloadCapacity;

  /* ===== pricing ===== */
  pricing: {
    basePrice: number;
    currency: string;
  };

  /* ===== inventory ===== */
  inventory: {
    totalRooms: number;
  };

  /* ===== translations ===== */
  translations: Record<string, RoomTranslation>;

  /* ===== booking ===== */
  bookingConfig: {
    minNights: number;
    maxNights?: number;
    allowInstantBooking: boolean;
  };

  /* ===== hotel (populated) ===== */
  hotelId?:
    | string
    | {
        _id: string;
        slug: string;
        translations?: Record<string, { name?: string }>;
        provinceId?:
          | string
          | { _id: string; name?: { vi?: string; en?: string }; code?: string; slug?: string };
      };

  /* ===== amenities ===== */
  amenities?: {
    translations: Record<string, AmenityTranslation>;
    isActive: boolean;
    icon?: File | null;
  }[];

  /* ===== sale ===== */
  sale?: RoomSale;

  /* ===== images ===== */
  thumbnail?: RoomImage;
  gallery?: RoomImage[];

  /* ===== system ===== */
  createdAt: string;
  updatedAt: string;
}

export interface RoomListResponse {
  items: Room[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
