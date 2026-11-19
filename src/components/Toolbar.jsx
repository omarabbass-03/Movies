const RATINGS = [
  { value: 0, label: 'Any' },
  { value: 6, label: '6+' },
  { value: 7, label: '7+' },
  { value: 8, label: '8+' },
];

export default function Toolbar({ title, subtitle, minRating, onMinRatingChange, sort, onSortChange }) {
  return (
    <div className="toolbar">
      <div>
        <h2 className="toolbar__title">{title}</h2>
        <p className="toolbar__subtitle">{subtitle}</p>
      </div>

      <div className="toolbar__controls">
        <div className="chips" role="radiogroup" aria-label="Minimum rating">
          <span className="chips__label">Rating</span>
          {RATINGS.map((r) => (
            <button
              key={r.value}
              role="radio"
              aria-checked={minRating === r.value}
              className={`chip ${minRating === r.value ? 'chip--active' : ''}`}
              onClick={() => onMinRatingChange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <label className="select">
          <span className="sr-only">Sort by</span>
          <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
            <option value="default">Sort: Relevance</option>
            <option value="rating">Sort: Highest rated</option>
            <option value="newest">Sort: Newest</option>
            <option value="title">Sort: Title A–Z</option>
          </select>
        </label>
      </div>
    </div>
  );
}
