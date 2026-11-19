import { posterUrl, ratingTone, year } from '../api.js';
import { BookmarkIcon, FilmIcon, StarIcon } from './Icons.jsx';

export default function MovieCard({ movie, onSelect, saved, onToggleSave }) {
  const poster = posterUrl(movie.poster_path);
  const rating = movie.vote_average || 0;

  return (
    <article className="card">
      <button className="card__hit" onClick={onSelect} aria-label={`${movie.title}, details`}>
        <div className="card__poster">
          {poster ? (
            <img
              src={poster}
              srcSet={`${posterUrl(movie.poster_path, 'w185')} 185w, ${poster} 342w, ${posterUrl(movie.poster_path, 'w500')} 500w`}
              sizes="(max-width: 600px) 45vw, 220px"
              alt=""
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="card__fallback">
              <FilmIcon width={36} height={36} />
              <span>No poster</span>
            </div>
          )}
          <div className="card__overlay">
            <p>{movie.overview || 'No overview available.'}</p>
            <span className="card__cta">View details →</span>
          </div>
        </div>
        <div className="card__body">
          <h3 className="card__title">{movie.title}</h3>
          <div className="card__meta">
            <span className={`rating rating--${ratingTone(rating)}`}>
              <StarIcon width={13} height={13} /> {rating ? rating.toFixed(1) : 'NR'}
            </span>
            <span>{year(movie.release_date)}</span>
          </div>
        </div>
      </button>

      <button
        className={`card__save ${saved ? 'card__save--on' : ''}`}
        onClick={onToggleSave}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
        title={saved ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <BookmarkIcon filled={saved} width={18} height={18} />
      </button>
    </article>
  );
}
