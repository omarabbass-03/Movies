import { useCallback, useEffect, useRef, useState } from 'react';
import { tmdb } from '../api.js';

/** Paginated movie list for a category, or search results when `query` is set. */
export function useMovies(category, query) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const abortRef = useRef(null);

  const path = query ? 'search/movie' : `movie/${category}`;

  const fetchPage = useCallback(
    async (p, signal) => {
      const params = { page: p };
      if (query) params.query = query;
      return tmdb(path, params, signal);
    },
    [path, query],
  );

  // Reset and load the first page whenever the source changes.
  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus('loading');
    setMovies([]);
    setPage(1);

    fetchPage(1, ctrl.signal)
      .then((data) => {
        setMovies(dedupe(data.results || []));
        setTotalPages(Math.min(data.total_pages || 1, 500));
        setStatus('ready');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setStatus('error');
      });

    return () => ctrl.abort();
  }, [fetchPage, reloadKey]);

  const loadMore = useCallback(async () => {
    if (loadingMore || status !== 'ready' || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const data = await fetchPage(page + 1, abortRef.current?.signal);
      setMovies((prev) => dedupe([...prev, ...(data.results || [])]));
      setPage((p) => p + 1);
    } catch {
      /* keep what we have; user can retry by scrolling again */
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, loadingMore, page, status, totalPages]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  return { movies, status, loadMore, loadingMore, hasMore: page < totalPages, retry };
}

function dedupe(list) {
  const seen = new Set();
  return list.filter((m) => (seen.has(m.id) ? false : seen.add(m.id)));
}
