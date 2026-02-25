import type { Province } from './province';

export type TourGuideTranslation = {
  bio: string;
  shortBio?: string;
  specialties?: string;
};

export type TourGuideGalleryItem = {
  url: string;
  publicId?: string;
  alt?: string;
};

export type TourGuideCV = {
  url: string;
  publicId?: string;
  filename?: string;
};

export interface TourGuide {
  _id: string;
  userId: string;
  user?: {
    _id: string;
    username?: string;
    fullName?: string;
    email?: string;
  };
  translations: Record<string, TourGuideTranslation>;
  languages: string[];
  specializedProvinces: Array<string | Province>;
  certifications: string[];
  licenseNumber?: string;
  yearsOfExperience?: number;
  gallery: TourGuideGalleryItem[];
  cv?: TourGuideCV;
  ratingSummary?: {
    average: number;
    total: number;
  };
  isAvailable: boolean;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  dailyRate?: number;
  currency: string;
  contactMethods: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TourGuideQueryParams {
  page?: number;
  limit?: number;
  provinceId?: string;
  language?: string;
  isVerified?: boolean;
  isAvailable?: boolean;
  minRating?: number;
  search?: string;
  sort?: 'rating' | 'experience' | 'newest';
}

export interface TourGuidePaginatedResponse {
  items: TourGuide[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type TourGuideUpsertPayload = {
  userId: string;
  translations: Record<string, TourGuideTranslation>;
  languages: string[];
  specializedProvinces: string[];
  certifications?: string[];
  licenseNumber?: string;
  yearsOfExperience?: number;
  gallery?: TourGuideGalleryItem[];
  isAvailable?: boolean;
  dailyRate?: number;
  currency?: string;
  contactMethods?: string[];
};

