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

  /* ===== amenities ===== */
  amenities?: {
    code: string;
    icon?: string;
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
