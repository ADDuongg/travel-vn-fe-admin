/**
 * Access token lưu trong memory (giảm rủi ro XSS).
 * Refresh token do Backend lưu HTTP-only cookie, FE không đọc/ghi.
 */
let accessToken: string | null = null;
let authUser: unknown | null = null;

export const authUtils = {
  getAuthUser() {
    return authUser;
  },

  setAuthUser(user: unknown) {
    authUser = user;
  },

  getAccessToken() {
    return accessToken;
  },

  setAccessToken(token: string) {
    accessToken = token;
  },

  clearAccessToken() {
    accessToken = null;
  },

  /** No-op: refresh token do BE quản lý qua HTTP-only cookie */
  getRefreshToken() {
    return null;
  },
  setRefreshToken() {},
  clearRefreshToken() {},
};
