import { useState, useEffect, useCallback, useRef } from 'react';

export function useFootballData(fetchFn, deps = [], interval = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const fetch = useCallback(async () => {
    try {
      const result = await fetchFn();
      if (mounted.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mounted.current) setError(err.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    fetch();
    const timer = interval ? setInterval(fetch, interval) : null;
    return () => {
      mounted.current = false;
      if (timer) clearInterval(timer);
    };
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useMultiData(fetchMap, deps = [], interval = null) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const fetchAll = useCallback(async () => {
    try {
      const entries = Object.entries(fetchMap);
      const results = await Promise.allSettled(entries.map(([, fn]) => fn()));
      const newData = {};
      entries.forEach(([key], i) => {
        newData[key] = results[i].status === 'fulfilled' ? results[i].value : null;
      });
      if (mounted.current) { setData(newData); setError(null); }
    } catch (err) {
      if (mounted.current) setError(err.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    fetchAll();
    const timer = interval ? setInterval(fetchAll, interval) : null;
    return () => {
      mounted.current = false;
      if (timer) clearInterval(timer);
    };
  }, [fetchAll]);

  return { data, loading, error, refresh: fetchAll };
}
