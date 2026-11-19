export const CATEGORIES = [
  { id: 'now_playing', label: 'Now Playing', blurb: 'In theaters right now' },
  { id: 'popular', label: 'Popular', blurb: 'What everyone is watching' },
  { id: 'top_rated', label: 'Top Rated', blurb: 'The highest rated of all time' },
  { id: 'upcoming', label: 'Upcoming', blurb: 'Coming soon to theaters' },
];

const IMG = 'https://image.tmdb.org/t/p';
export const posterUrl = (p, size = 'w342') => (p ? `${IMG}/${size}${p}` : null);
export const backdropUrl = (p, size = 'w1280') => (p ? `${IMG}/${size}${p}` : null);
export const profileUrl = (p) => (p ? `${IMG}/w185${p}` : null);

export async function tmdb(path, params = {}, signal) {
  const qs = new URLSearchParams({ path, ...params });
  const res = await fetch(`/api/tmdb?${qs}`, { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export const year = (date) => (date ? date.slice(0, 4) : '—');

export function formatRuntime(min) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function formatDate(date) {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ratingTone(v) {
  if (v >= 7.5) return 'high';
  if (v >= 6) return 'mid';
  return 'low';
}
