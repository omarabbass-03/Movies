// Serverless proxy for TMDB so the API token never ships to the browser.
// Usage: /api/tmdb?path=movie/popular&page=2

const ALLOWED_PATHS = [
  /^movie\/(now_playing|popular|top_rated|upcoming)$/,
  /^movie\/\d+$/,
  /^search\/movie$/,
  /^trending\/movie\/(day|week)$/,
];
const ALLOWED_PARAMS = ['page', 'query', 'append_to_response', 'region'];

export async function handleTmdb(request, token) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path') || '';

  if (!ALLOWED_PATHS.some((re) => re.test(path))) {
    return Response.json({ error: 'Path not allowed' }, { status: 400 });
  }
  if (!token) {
    return Response.json({ error: 'TMDB_TOKEN is not configured' }, { status: 500 });
  }

  const target = new URL(`https://api.themoviedb.org/3/${path}`);
  target.searchParams.set('language', 'en-US');
  target.searchParams.set('include_adult', 'false');
  for (const key of ALLOWED_PARAMS) {
    const value = url.searchParams.get(key);
    if (value) target.searchParams.set(key, value);
  }

  try {
    const upstream = await fetch(target, {
      headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        'content-type': 'application/json',
        'cache-control': upstream.ok
          ? 's-maxage=900, stale-while-revalidate=86400'
          : 'no-store',
      },
    });
  } catch {
    return Response.json({ error: 'Upstream request failed' }, { status: 502 });
  }
}

export function GET(request) {
  return handleTmdb(request, process.env.TMDB_TOKEN);
}
