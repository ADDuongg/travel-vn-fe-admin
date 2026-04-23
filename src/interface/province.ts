export type ProvinceRegion = 'NORTH' | 'CENTRAL' | 'SOUTH';

export interface ProvinceSeo {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ProvinceTranslation {
  description?: string;
  shortDescription?: string;
  seo?: ProvinceSeo;
}

export interface ProvinceThumbnail {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface ProvinceGalleryItem {
  url: string;
  publicId?: string;
  alt?: string;
  order?: number;
}

export interface ProvinceWard {
  code: string;
  slug?: string;
  name?: { vi?: string; en?: string };
  fullName?: { vi?: string; en?: string };
}

export interface ProvinceLocalizedText {
  vi?: string;
  en?: string;
}

export interface ProvinceHighlightThumbnail {
  url: string;
  publicId?: string;
  alt?: string;
  order?: number;
}

export interface ProvinceHighlight {
  name?: ProvinceLocalizedText;
  thumbnail?: ProvinceHighlightThumbnail;
  description?: ProvinceLocalizedText;
}

export interface Province {
  _id: string;
  type?: 'province';
  code: string;
  slug: string;
  name: { vi: string; en: string };
  fullName?: { vi: string; en: string };
  thumbnail?: ProvinceThumbnail;
  translations?: Record<string, ProvinceTranslation>;
  isPopular?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  region?: ProvinceRegion;
  population?: number;
  area?: number;
  bestTimeToVisit?: ProvinceLocalizedText;
  highlights?: ProvinceHighlight[];
  totalHotels?: number;
  totalTours?: number;
  totalTourGuides?: number;
}

export interface ProvinceListResponse {
  items: Province[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProvinceDetail extends Province {
  gallery?: ProvinceGalleryItem[];
  wards?: ProvinceWard[];
}

export interface ProvinceQueryParams {
  page?: number;
  limit?: number;
  region?: ProvinceRegion;
  isPopular?: boolean;
  isActive?: boolean;
  search?: string;
  sort?: string;
}

export interface ProvinceMetadataUpdatePayload {
  translations?: Record<string, ProvinceTranslation>;
  isPopular?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  region?: ProvinceRegion;
  population?: number;
  area?: number;
  bestTimeToVisit?: ProvinceLocalizedText;
  highlights?: ProvinceHighlight[];
  gallery?: ProvinceGalleryItem[];
  thumbnail?: ProvinceThumbnail;
}
