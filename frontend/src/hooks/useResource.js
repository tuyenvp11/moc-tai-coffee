import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
export function useResource(path) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ path: null, data: null, loading: true, error: null });
  const retry = useCallback(() => setAttempt(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setResult({ path, data: null, loading: true, error: null });
    api(path, { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setResult({ path, data, loading: false, error: null });
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ path, data: null, loading: false, error: error.message || 'Không thể tải dữ liệu.' });
    });
    return () => controller.abort();
  }, [path, attempt]);
  return { ...(result.path === path ? result : { data: null, loading: true, error: null }), retry };
}
