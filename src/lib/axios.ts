import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    rawResponse?: boolean;
  }
}

class AxiosClient {
  private client: AxiosInstance;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || '') {
    this.client = axios.create({ baseURL, timeout: 10000 });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('access_token')
            : null;
        if (token) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (res: AxiosResponse) => (res.config.rawResponse ? res : res.data?.data),
      (error) => {
        const message =
          error?.response?.data?.message ??
          error?.message ??
          'Unexpected error';
        return Promise.reject({ ...error, message });
      },
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get<T, T>(url, config);
  }
  post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T> {
    return this.client.post<T, T, D>(url, data, config);
  }
  put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T> {
    return this.client.put<T, T, D>(url, data, config);
  }
  patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T> {
    return this.client.patch<T, T, D>(url, data, config);
  }
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete<T, T>(url, config);
  }

  getRaw<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T, AxiosResponse<T>>(url, {
      ...config,
      rawResponse: true,
    });
  }
  postRaw<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T, AxiosResponse<T>, D>(url, data, {
      ...config,
      rawResponse: true,
    });
  }
}

export default new AxiosClient();
