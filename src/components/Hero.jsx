import { backdropUrl, year } from '../api.js';
import { BookmarkIcon, InfoIcon, StarIcon } from './Icons.jsx';

export default function Hero({ movie, label, onOpen, inWatchlist, onToggleWatchlist }) {
  return (
    <section className="hero" aria-label="Featured movie">
      <img
        className="hero__backdrop"
        src={backdropUrl(movie.backdrop_path)}
        srcSet={`${backdropUrl(movie.backdrop_path, 'w780')} 780w, ${backdropUrl(movie.backdrop_path)} 1280w, ${backdropUrl(movie.backdrop_path, 'original')} 1920w`}
        sizes="100vw"
        alt=""
        fetchPriority="high"
      />
      <div className="hero__shade" />
      <div className="container hero__content">
        <span className="eyebrow">Featured · {label}</span>
        <h1 className="hero__title">{movie.title}</h1>
        <div className="meta">
          <span className="meta__rating">
            <StarIcon width={16} height={16} /> {movie.vote_average.toFixed(1)}
          </span>
          <span>{year(movie.release_date)}</span>
          <span>{movie.vote_count.toLocaleString()} votes</span>
        </div>
        <p className="hero__overview">{movie.overview}</p>
        <div className="actions">
          <button className="btn btn--primary" onClick={onOpen}>
            <InfoIcon /> More info
          </button>
          <button className="btn btn--ghost" onClick={onToggleWatchlist} aria-pressed={inWatchlist}>
            <BookmarkIcon filled={inWatchlist} /> {inWatchlist ? 'In watchlist' : 'Watchlist'}
          </button>
        </div>
      </div>
    </section>
  );
}
