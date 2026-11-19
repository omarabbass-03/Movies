import { useCallback, useEffect, useState } from 'react';

const KEY = 'cinescope:watchlist';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [list, setList] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      /* storage unavailable — keep in memory */
    }
  }, [list]);

  const has = useCallback((id) => list.some((m) => m.id === id), [list]);

  const toggle = useCallback((movie) => {
    setList((prev) =>
      prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [
            {
              id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path,
              backdrop_path: movie.backdrop_path,
              vote_average: movie.vote_average,
              release_date: movie.release_date,
              overview: movie.overview,
            },
            ...prev,
          ],
    );
  }, []);

  return { list, has, toggle };
}
