import api from '@/lib/axios';
import type { Language } from '@interface/commons';

/** docs/MODULES-12-15-FE-API.md — GET public, mutations admin */

export const getLanguages = () =>
  api.get<Language[]>('/api/v1/public/languages');

export const createLanguage = (data: FormData) =>
  api.post('/api/v1/admin/languages', data);

export const updateLanguage = (code: string, data: FormData) =>
  api.put(`/api/v1/admin/languages/${encodeURIComponent(code)}`, data);

export const deleteLanguage = (code: string) =>
  api.delete(`/api/v1/admin/languages/${encodeURIComponent(code)}`);
