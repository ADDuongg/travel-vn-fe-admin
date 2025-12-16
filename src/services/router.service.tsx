import api from '@/lib/axios';
export type Router = {
  _id: string;
  code: string;
  name: string;
  path: string;
  parentCode?: string;
};

export const getRouters = async (): Promise<Router[]> => {
  return api.get<Router[]>('/routers');
};
