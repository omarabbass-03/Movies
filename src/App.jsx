import { useCallback, useEffect, useMemo, useState } from 'react';
import { CATEGORIES } from './api.js';
import { useMovies } from './hooks/useMovies.js';
import { useWatchlist } from './hooks/useWatchlist.js';
import { useDebounce } from './hooks/useDebounce.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Toolbar from './components/Toolbar.jsx';
import MovieGrid from './components/MovieGrid.jsx';
import MovieModal from './components/MovieModal.jsx';

const VIEWS = [...CATEGORIES.map((c) => c.id), 'watchlist'];

function readUrl() {
  const p = new URLSearchParams(window.location.search);
  const view = p.get('view');
  return {
    view: VIEWS.includes(view) ? view : 'now_playing',
    query: p.get('q') || '',
    movieId: Number(p.get('movie')) || null,
  };
}

const SORTERS = {
  default: null,
  rating: (a, b) => b.vote_average - a.vote_average,
  newest: (a, b) => (b.release_date || '').localeCompare(a.release_date || ''),
  title: (a, b) => a.title.localeCompare(b.title),
};

export default function App() {
  const initial = useMemo(readUrl, []);
  const [view, setView] = useState(initial.view);
  const [query, setQuery] = useState(initial.query);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState('default');
  const [selectedId, setSelectedId] = useState(initial.movieId);

  const debouncedQuery = useDebounce(query.trim(), 400);
  const searching = debouncedQuery.length > 0;
  const category = view === 'watchlist' ? 'now_playing' : view;

  const remote = useMovies(category, debouncedQuery);
  const watchlist = useWatchlist();

  const showingWatchlist = view === 'watchlist' && !searching;
  const source = showingWatchlist ? watchlist.list : remote.movies;

  const movies = useMemo(() => {
    let list = minRating ? source.filter((m) => m.vote_average >= minRating) : source;
    const sorter = SORTERS[sort];
    if (sorter) list = [...list].sort(sorter);
    return list;
  }, [source, minRating, sort]);

  // Keep the URL shareable: ?view=popular&q=batman&movie=123
  useEffect(() => {
    const p = new URLSearchParams();
    if (view !== 'now_playing') p.set('view', view);
    if (debouncedQuery) p.set('q', debouncedQuery);
    if (selectedId) p.set('movie', selectedId);
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [view, debouncedQuery, selectedId]);

  const meta = CATEGORIES.find((c) => c.id === view);
  const title = searching
    ? `Results for “${debouncedQuery}”`
    : showingWatchlist
      ? 'My Watchlist'
      : meta.label;
  const subtitle = searching
    ? 'Searching all movies'
    : showingWatchlist
      ? `${watchlist.list.length} saved ${watchlist.list.length === 1 ? 'movie' : 'movies'}`
      : meta.blurb;

  const featured =
    !searching && !showingWatchlist && remote.status === 'ready'
      ? remote.movies.find((m) => m.backdrop_path)
      : null;

  const closeModal = useCallback(() => setSelectedId(null), []);

  const changeView = (id) => {
    setView(id);
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header
        view={view}
        onViewChange={changeView}
        query={query}
        onQueryChange={setQuery}
        watchlistCount={watchlist.list.length}
      />

      <main>
        {featured && (
          <Hero
            movie={featured}
            label={meta.label}
            onOpen={() => setSelectedId(featured.id)}
            inWatchlist={watchlist.has(featured.id)}
            onToggleWatchlist={() => watchlist.toggle(featured)}
          />
        )}

        <section className={`content container ${featured ? '' : 'content--no-hero'}`}>
          <Toolbar
            title={title}
            subtitle={subtitle}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            sort={sort}
            onSortChange={setSort}
            count={movies.length}
          />

          <MovieGrid
            movies={movies}
            status={showingWatchlist ? 'ready' : remote.status}
            hasMore={!showingWatchlist && remote.hasMore}
            loadingMore={remote.loadingMore}
            onLoadMore={remote.loadMore}
            onRetry={remote.retry}
            onSelect={(m) => setSelectedId(m.id)}
            isSaved={watchlist.has}
            onToggleSave={watchlist.toggle}
            emptyState={
              showingWatchlist && !watchlist.list.length
                ? {
                    title: 'Your watchlist is empty',
                    text: 'Tap the bookmark on any movie to save it here for later.',
                    action: { label: 'Browse popular movies', onClick: () => changeView('popular') },
                  }
                : minRating && source.length
                  ? {
                      title: `No movies rated ${minRating}+ here`,
                      text: 'Try lowering the minimum rating.',
                      action: { label: 'Clear rating filter', onClick: () => setMinRating(0) },
                    }
                  : {
                      title: 'No movies found',
                      text: searching
                        ? 'Check the spelling or try a different title.'
                        : 'Nothing to show right now.',
                    }
            }
          />
        </section>
      </main>

      <footer className="footer container">
        <p>
          Data from <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">TMDB</a>.
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </footer>

      {selectedId && (
        <MovieModal
          id={selectedId}
          onClose={closeModal}
          isSaved={watchlist.has(selectedId)}
          onToggleSave={watchlist.toggle}
        />
      )}
    </>
  );
}
