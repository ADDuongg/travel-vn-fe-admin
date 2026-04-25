import api from '@/lib/axios';

/** Normalized item after upload (BE may return `url`/`publicId` or legacy `secure_url`/`public_id`). */
export type NormalizedMediaUpload = {
  url: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
};

/**
 * Map raw API response to `{ url, publicId, ... }` for use in province PATCH payload.
 */
export function normalizeMediaUploadResponse(
  raw: unknown,
): NormalizedMediaUpload {
  if (raw == null || typeof raw !== 'object') {
    throw new Error('Phản hồi tải ảnh không hợp lệ');
  }
  const r = raw as Record<string, unknown>;
  const url =
    (typeof r.url === 'string' && r.url) ||
    (typeof r.secure_url === 'string' && r.secure_url) ||
    '';
  const publicId =
    (typeof r.publicId === 'string' && r.publicId) ||
    (typeof r.public_id === 'string' && r.public_id) ||
    undefined;
  if (!url) {
    throw new Error('Thiếu URL ảnh sau khi tải lên');
  }
  return {
    url,
    ...(publicId ? { publicId } : {}),
    ...(typeof r.format === 'string' ? { format: r.format } : {}),
    ...(typeof r.width === 'number' ? { width: r.width } : {}),
    ...(typeof r.height === 'number' ? { height: r.height } : {}),
    ...(typeof r.bytes === 'number' ? { bytes: r.bytes } : {}),
  };
}

export const uploadMedia = async (file: File): Promise<NormalizedMediaUpload> => {
  const formData = new FormData();
  formData.append('file', file);
  const raw = await api.post<unknown>('/api/v1/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeMediaUploadResponse(raw);
};

/**
 * Upload several files in one request (`files` field per BE handoff).
 */
export const uploadMediaMultiple = async (
  files: File[],
): Promise<NormalizedMediaUpload[]> => {
  if (files.length === 0) return [];
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  const raw = await api.post<unknown>(
    '/api/v1/media/upload-multiple',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  if (!Array.isArray(raw)) {
    throw new Error('Phản hồi upload nhiều ảnh phải là mảng');
  }
  return raw.map((item) => normalizeMediaUploadResponse(item));
};
