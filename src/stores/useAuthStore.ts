import { create } from 'zustand';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  authUser: any | null;
  setUser: (user: any) => void;
  clearUser: () => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'checking',
  authUser: null,

  setUser: (authUser) =>
    set({
      authUser,
      status: 'authenticated',
    }),

  clearUser: () =>
    set({
      authUser: null,
      status: 'unauthenticated',
    }),

  setStatus: (status) => set({ status }),
}));
