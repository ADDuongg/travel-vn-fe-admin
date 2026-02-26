import { useEffect } from 'react';
import { useRefresh } from '@/queries/auth.queries';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Gọi khi app load: refresh token (cookie gửi kèm) để khôi phục session.
 */
export function useInitAuth() {
  const clearUser = useAuthStore((s) => s.clearUser);
  const { refreshAsync } = useRefresh();

  useEffect(() => {
    const init = async () => {
      try {
        await refreshAsync();
      } catch {
        clearUser();
      }
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
