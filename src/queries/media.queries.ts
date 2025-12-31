import { useMutation } from '@tanstack/react-query';
import { uploadMedia } from '@/services/media.service';

export const useUploadMedia = () => {
  return useMutation({
    mutationFn: uploadMedia,
  });
};
