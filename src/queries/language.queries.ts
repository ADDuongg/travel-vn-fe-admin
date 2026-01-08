import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from '@/services/language.service';
import type { Language } from '@interface/commons';

export const LANGUAGE_QUERY_KEY = ['languages'];

export const useLanguages = () =>
  useQuery<Language[]>({
    queryKey: LANGUAGE_QUERY_KEY,
    queryFn: getLanguages,
  });

export const useCreateLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: LANGUAGE_QUERY_KEY,
      });
    },
  });
};

export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: FormData }) =>
      updateLanguage(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: LANGUAGE_QUERY_KEY,
      });
    },
  });
};

export const useDeleteLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: LANGUAGE_QUERY_KEY,
      });
    },
  });
};
