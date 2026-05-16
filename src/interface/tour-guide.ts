import type { Province } from './province';

export type TourGuideTranslation = {
  bio?: string;
  shortBio?: string;
  specialties?: string;
  /** Mảng chuỗi chuyên môn theo ngôn ngữ (cùng thứ tự giữa các lang) */
  specialtyItems?: string[];
};

export type TourGuideGalleryItem = {
  url: string;
  publicId?: string;
  alt?: string;
  order?: number;
};

export type TourGuideCV = {
  url: string;
  publicId?: string;
  filename?: string;
  format?: string;
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
  /** Tỷ lệ phản hồi 0–100 */
  responseRate?: number;
  /** Số chuyến đi hoàn tất */
  completedTripsCount?: number;
  /** Tỷ lệ khách quay lại 0–100 */
  returningCustomerRate?: number;
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
  /** Filter theo trạng thái active (guide còn hoạt động / đã soft-delete) */
  isActive?: boolean;
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
  /** Đã upload qua /admin/media/upload; PATCH: `null` = xoá CV */
  cv?: TourGuideCV | null;
  gallery?: TourGuideGalleryItem[];
  /** Tỷ lệ phản hồi 0–100 */
  responseRate?: number;
  /** Số chuyến đi hoàn tất */
  completedTripsCount?: number;
  /** Tỷ lệ khách quay lại 0–100 */
  returningCustomerRate?: number;
  isAvailable?: boolean;
  dailyRate?: number;
  currency?: string;
  contactMethods?: string[];
};

