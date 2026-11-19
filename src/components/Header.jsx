import { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../api.js';
import { CloseIcon, SearchIcon } from './Icons.jsx';

export default function Header({ view, onViewChange, query, onQueryChange, watchlistCount }) {
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Press "/" anywhere to jump to search.
  useEffect(() => {
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const tabs = [...CATEGORIES, { id: 'watchlist', label: 'Watchlist' }];

  return (
    <header className={`header ${scrolled ? 'header--solid' : ''}`}>
      <div className="container header__inner">
        <a
          href="/"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            onViewChange('now_playing');
          }}
        >
          <span className="logo__mark" aria-hidden="true">▶</span>
          Cine<span>Scope</span>
        </a>

        <nav className="tabs" aria-label="Movie categories">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab ${view === t.id && !query ? 'tab--active' : ''}`}
              aria-current={view === t.id && !query ? 'page' : undefined}
              onClick={() => onViewChange(t.id)}
            >
              {t.label}
              {t.id === 'watchlist' && watchlistCount > 0 && (
                <span className="tab__badge">{watchlistCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="search">
          <SearchIcon className="search__icon" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onQueryChange('')}
            placeholder="Search movies…"
            aria-label="Search movies"
          />
          {query ? (
            <button className="search__clear" onClick={() => onQueryChange('')} aria-label="Clear search">
              <CloseIcon width={16} height={16} />
            </button>
          ) : (
            <kbd className="search__kbd" aria-hidden="true">/</kbd>
          )}
        </div>
      </div>
    </header>
  );
}
