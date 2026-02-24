import { useEffect } from 'react';
import { useRefresh } from '@/queries/auth.queries';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Gọi khi app load: refresh token (cookie gửi kèm) để khôi phục session.
 */
export function useInitAuth() {
  const clearUser = useAuthStore((s) => s.clearUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const { refresh } = useRefresh();

  useEffect(() => {
    const init = async () => {
      try {
        refresh();
      } catch {
        clearUser();
      } finally {
        setStatus('unauthenticated');
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
