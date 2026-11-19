import { useEffect, useRef, useState } from 'react';
import {
  backdropUrl,
  formatDate,
  formatRuntime,
  posterUrl,
  profileUrl,
  ratingTone,
  tmdb,
} from '../api.js';
import { BookmarkIcon, CloseIcon, FilmIcon, PlayIcon, StarIcon } from './Icons.jsx';

export default function MovieModal({ id, onClose, isSaved, onToggleSave }) {
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setMovie(null);
    setError(false);
    setPlaying(false);
    tmdb(`movie/${id}`, { append_to_response: 'videos,credits' }, ctrl.signal)
      .then(setMovie)
      .catch((e) => e.name !== 'AbortError' && setError(true));
    return () => ctrl.abort();
  }, [id]);

  // Esc to close, lock background scroll, restore focus on close.
  useEffect(() => {
    const prevFocus = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') trapFocus(e, dialogRef.current);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prevFocus?.focus?.();
    };
  }, [onClose]);

  const trailer = movie?.videos?.results?.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official !== false,
  ) || movie?.videos?.results?.find((v) => v.site === 'YouTube');
  const cast = movie?.credits?.cast?.slice(0, 10) || [];
  const director = movie?.credits?.crew?.find((c) => c.job === 'Director');

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={movie?.title || 'Movie details'}
        ref={dialogRef}
        tabIndex={-1}
      >
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        {error && (
          <div className="state">
            <FilmIcon width={40} height={40} />
            <h3>Couldn’t load this movie</h3>
            <button className="btn btn--ghost" onClick={onClose}>Close</button>
          </div>
        )}

        {!movie && !error && <div className="modal__loading"><div className="spinner" /></div>}

        {movie && (
          <>
            <div className="modal__media">
              {playing && trailer ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
                  title={`${movie.title} trailer`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  {movie.backdrop_path && <img src={backdropUrl(movie.backdrop_path)} alt="" />}
                  <div className="modal__media-shade" />
                  {trailer && (
                    <button className="play" onClick={() => setPlaying(true)} aria-label="Play trailer">
                      <PlayIcon width={28} height={28} />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="modal__body">
              {movie.poster_path && (
                <img className="modal__poster" src={posterUrl(movie.poster_path)} alt={`${movie.title} poster`} />
              )}
              <div className="modal__info">
                <h2 className="modal__title">{movie.title}</h2>
                {movie.tagline && <p className="modal__tagline">{movie.tagline}</p>}

                <div className="meta">
                  <span className={`rating rating--${ratingTone(movie.vote_average)}`}>
                    <StarIcon width={14} height={14} /> {movie.vote_average?.toFixed(1)}
                  </span>
                  <span>{formatDate(movie.release_date)}</span>
                  {formatRuntime(movie.runtime) && <span>{formatRuntime(movie.runtime)}</span>}
                </div>

                {movie.genres?.length > 0 && (
                  <ul className="genres">
                    {movie.genres.map((g) => <li key={g.id}>{g.name}</li>)}
                  </ul>
                )}

                <p className="modal__overview">{movie.overview || 'No overview available.'}</p>
                {director && (
                  <p className="modal__credit"><span>Director</span> {director.name}</p>
                )}

                <div className="actions">
                  {trailer && !playing && (
                    <button className="btn btn--primary" onClick={() => setPlaying(true)}>
                      <PlayIcon /> Watch trailer
                    </button>
                  )}
                  <button className="btn btn--ghost" onClick={() => onToggleSave(movie)} aria-pressed={isSaved}>
                    <BookmarkIcon filled={isSaved} /> {isSaved ? 'In watchlist' : 'Add to watchlist'}
                  </button>
                </div>
              </div>
            </div>

            {cast.length > 0 && (
              <div className="cast">
                <h3>Top cast</h3>
                <ul>
                  {cast.map((p) => (
                    <li key={p.credit_id}>
                      {profileUrl(p.profile_path) ? (
                        <img src={profileUrl(p.profile_path)} alt="" loading="lazy" />
                      ) : (
                        <div className="cast__fallback">{p.name[0]}</div>
                      )}
                      <strong>{p.name}</strong>
                      <span>{p.character}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function trapFocus(e, root) {
  if (!root) return;
  const items = root.querySelectorAll('button, [href], iframe, [tabindex]:not([tabindex="-1"])');
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
