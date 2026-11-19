import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleTmdb } from './api/tmdb.js';

// Runs the same /api/tmdb handler locally that Vercel runs in production.
function tmdbDevProxy(token) {
  return {
    name: 'tmdb-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/tmdb', async (req, res) => {
        const request = new Request(`http://localhost${req.originalUrl}`);
        const response = await handleTmdb(request, token);
        res.statusCode = response.status;
        response.headers.forEach((v, k) => res.setHeader(k, v));
        res.end(await response.text());
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tmdbDevProxy(env.TMDB_TOKEN)],
  };
});
