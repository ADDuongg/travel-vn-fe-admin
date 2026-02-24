import api from '@/lib/axios';
import type { LoginFormValues, LoginPayload } from '@/interface/auth';

export function login(data: LoginFormValues) {
  return api.post<LoginPayload>('/api/v1/auth/login', data);
}

export function register(data: LoginFormValues) {
  return api.post<LoginPayload>('/api/v1/auth/register', data);
}

export function logout() {
  return api.post<void>('/api/v1/auth/logout');
}

export function getMe() {
  return api.get<LoginPayload>('/api/v1/auth/me');
}

export function refresh() {
  return api.post<LoginPayload>('/api/v1/auth/refresh');
}
