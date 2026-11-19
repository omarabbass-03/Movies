import { useEffect, useRef } from 'react';
import MovieCard from './MovieCard.jsx';
import { FilmIcon } from './Icons.jsx';

export default function MovieGrid({
  movies,
  status,
  hasMore,
  loadingMore,
  onLoadMore,
  onRetry,
  onSelect,
  isSaved,
  onToggleSave,
  emptyState,
}) {
  const sentinel = useRef(null);

  // Infinite scroll: load the next page when the sentinel nears the viewport.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || status !== 'ready') return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && onLoadMore(), {
      rootMargin: '600px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, status, onLoadMore, movies.length]);

  if (status === 'loading') {
    return (
      <div className="grid" aria-busy="true" aria-label="Loading movies">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="skeleton" />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="state">
        <FilmIcon width={40} height={40} />
        <h3>Couldn’t load movies</h3>
        <p>Check your connection and try again.</p>
        <button className="btn btn--primary" onClick={onRetry}>Try again</button>
      </div>
    );
  }

  return (
    <>
      {movies.length === 0 && !hasMore ? (
        <div className="state">
          <FilmIcon width={40} height={40} />
          <h3>{emptyState.title}</h3>
          <p>{emptyState.text}</p>
          {emptyState.action && (
            <button className="btn btn--primary" onClick={emptyState.action.onClick}>
              {emptyState.action.label}
            </button>
          )}
        </div>
      ) : (
        <ul className="grid">
          {movies.map((m, i) => (
            <li key={m.id} style={{ '--i': i % 20 }}>
              <MovieCard
                movie={m}
                onSelect={() => onSelect(m)}
                saved={isSaved(m.id)}
                onToggleSave={() => onToggleSave(m)}
              />
            </li>
          ))}
          {loadingMore &&
            Array.from({ length: 6 }, (_, i) => <li key={`s${i}`} className="skeleton" />)}
        </ul>
      )}

      {hasMore && (
        <div ref={sentinel} className="load-more">
          {!loadingMore && (
            <button className="btn btn--ghost" onClick={onLoadMore}>Load more</button>
          )}
        </div>
      )}
    </>
  );
}
