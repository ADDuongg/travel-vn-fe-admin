import api from '@/lib/axios';
import type { Province } from '@/interface/province';

export const getProvinces = (): Promise<Province[]> =>
  api.get<Province[]>('/api/v1/provinces');
