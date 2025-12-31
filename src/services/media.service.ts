import api from '@/lib/axios';

export type UploadMediaResponse = {
  secure_url: string;
  public_id: string;
};

export const uploadMedia = async (file: File): Promise<UploadMediaResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post<UploadMediaResponse>('/api/v1/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
