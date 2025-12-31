import api from '@/lib/axios';

export type Router = {
  _id: string;
  code: string;
  name: string;
  path: string;
  parentCode?: string;
  order?: number;
  isActive: boolean;
};

export const getRouters = () => api.get<Router[]>('/api/v1/routers');

export const createRouter = (data: Partial<Router>) =>
  api.post('/api/v1/routers', data);

export const updateRouter = (code: string, data: Partial<Router>) =>
  api.put(`/api/v1/routers/${code}`, data);

export const deleteRouter = (code: string) =>
  api.delete(`/api/v1/routers/${code}`);
