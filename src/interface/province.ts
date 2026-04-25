import type { DynamicLocalized } from '@/lib/dynamic-localized';

export type { DynamicLocalized } from '@/lib/dynamic-localized';

export type ProvinceRegion = 'NORTH' | 'CENTRAL' | 'SOUTH';

export interface ProvinceSeo {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ProvinceTranslation {
  description?: string;
  shortDescription?: string;
  bestTimeToVisit?: string;
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
  name?: DynamicLocalized;
  fullName?: DynamicLocalized;
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

/** Per-language copy for one highlight (same pattern as province `translations[lang]`). */
export interface ProvinceHighlightTranslation {
  name?: string;
  description?: string;
}

export interface ProvinceHighlight {
  translations?: Record<string, ProvinceHighlightTranslation>;
  thumbnail?: ProvinceHighlightThumbnail;
}

/** API/DB có thể còn dạng cũ `name`/`description` dạng `{ vi, en }` cho đến khi BE migrate xong. */
export type ProvinceHighlightApi = ProvinceHighlight & {
  name?: ProvinceLocalizedText;
  description?: ProvinceLocalizedText;
};

/** Chuẩn hoá highlight từ API (mới hoặc legacy) thành shape dùng trong form. */
export function highlightsForForm(
  items: ProvinceHighlightApi[] | undefined,
): ProvinceHighlight[] {
  return (items ?? []).map((h) => {
    if (h.translations && Object.keys(h.translations).length > 0) {
      return {
        translations: { ...h.translations },
        ...(h.thumbnail ? { thumbnail: h.thumbnail } : {}),
      };
    }
    const translations: Record<string, ProvinceHighlightTranslation> = {};
    const { name, description } = h;
    if (name?.vi || description?.vi) {
      translations.vi = {
        ...(name?.vi && { name: name.vi }),
        ...(description?.vi && { description: description.vi }),
      };
    }
    if (name?.en || description?.en) {
      translations.en = {
        ...(name?.en && { name: name.en }),
        ...(description?.en && { description: description.en }),
      };
    }
    return {
      translations,
      ...(h.thumbnail ? { thumbnail: h.thumbnail } : {}),
    };
  });
}

export interface Province {
  _id: string;
  type?: 'province';
  code: string;
  slug: string;
  name: DynamicLocalized;
  fullName?: DynamicLocalized;
  thumbnail?: ProvinceThumbnail;
  translations?: Record<string, ProvinceTranslation>;
  isPopular?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  region?: ProvinceRegion;
  population?: number;
  area?: number;
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
  /** Pre-migration API/DB only; merge into translations on load. */
  bestTimeToVisit?: ProvinceLocalizedText;
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
  highlights?: ProvinceHighlight[];
  gallery?: ProvinceGalleryItem[];
  thumbnail?: ProvinceThumbnail;
}
