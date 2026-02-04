export interface HotelTranslation {
  name: string;
  description?: string;
  shortDescription?: string;
  address?: string;
  policies?: string[];
  seo?: { title?: string; description?: string };
}

export interface HotelContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface HotelLocation {
  lat?: number;
  lng?: number;
}

export interface ProvinceRef {
  _id: string;
  name: { vi: string; en: string };
  code: string;
  slug: string;
  fullName?: { vi: string; en: string };
}

export interface HotelImage {
  url: string;
  publicId?: string;
  alt?: string;
  order?: number;
}

/** List / options response */
export interface HotelOption {
  _id: string;
  slug: string;
  translations: Record<string, HotelTranslation>;
  provinceId: ProvinceRef | string;
}

/** Full detail response */
export interface Hotel {
  _id: string;
  slug: string;
  isActive: boolean;
  starRating: number;
  provinceId: string | ProvinceRef;
  translations: Record<string, HotelTranslation>;
  contact?: HotelContact;
  location?: HotelLocation;
  thumbnail?: { url: string; publicId?: string; alt?: string };
  gallery?: HotelImage[];
  amenities?: Array<{ _id: string; [key: string]: unknown }>;
}

export interface HotelCreateUpdateBody {
  slug: string;
  isActive?: boolean;
  starRating?: number;
  provinceId: string;
  translations: Record<string, HotelTranslation>;
  contact?: HotelContact;
  location?: HotelLocation;
  amenities?: string[];
}
