import api from '@/lib/axios';
import type { Language } from '@interface/commons';

export const getLanguages = () => api.get<Language[]>('/api/v1/languages');

export const createLanguage = (data: FormData) =>
  api.post('/api/v1/languages', data);

export const updateLanguage = (code: string, data: FormData) =>
  api.put(`/api/v1/languages/${code}`, data);

export const deleteLanguage = (code: string) =>
  api.delete(`/api/v1/languages/${code}`);
