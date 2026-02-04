export type RoomImage = {
  url: string;
  publicId?: string;
  order?: number;
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

  /* ===== capacity ===== */
  maxGuests: number;
  adults: number;
  children?: number;
  roomSize?: number;

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
