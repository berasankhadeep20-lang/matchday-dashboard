/**
 * MATCHDAY — Cloudflare Worker Proxy
 *
 * Proxies requests to api.football-data.org, injecting the API key
 * and adding CORS headers so GitHub Pages (or any origin) can call it.
 *
 * Deploy steps:
 *  1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 *  2. Paste this entire file, click Deploy
 *  3. Go to Settings → Variables → Add variable:
 *       Name:  FOOTBALL_API_KEY
 *       Value: a70d69b9cf704d9b9ccb39e67a3d064b
 *       ✅ Encrypt (tick this)
 *  4. Copy the worker URL e.g. https://matchday-proxy.YOUR-NAME.workers.dev
 *  5. Set VITE_PROXY_URL=https://matchday-proxy.YOUR-NAME.workers.dev
 *     in GitHub repo → Settings → Secrets and Variables → Actions → New variable
 */

const FOOTBALL_API_BASE = 'https://api.football-data.org/v4';

// Allowed origins — add more if needed
const ALLOWED_ORIGINS = [
  'https://berasankhadeep20-lang.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:80',
  'http://localhost',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Strip the worker's own origin to get the API path
    // e.g. https://matchday-proxy.xxx.workers.dev/competitions/PL/standings
    //   →  https://api.football-data.org/v4/competitions/PL/standings
    const url = new URL(request.url);
    const apiPath = url.pathname + url.search;
    const targetUrl = `${FOOTBALL_API_BASE}${apiPath}`;

    // Forward request to football-data.org with auth token from env secret
    let apiResponse;
    try {
      apiResponse = await fetch(targetUrl, {
        headers: {
          'X-Auth-Token': env.FOOTBALL_API_KEY,
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Upstream fetch failed', detail: err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    // Pass through throttle headers so the frontend can still track rate limits
    const responseHeaders = {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    };
    for (const header of ['X-Requests-Available-Minute', 'X-RequestCounter-Reset', 'X-Auth-Token-Expiration']) {
      const val = apiResponse.headers.get(header);
      if (val) responseHeaders[header] = val;
    }

    const body = await apiResponse.text();
    return new Response(body, {
      status: apiResponse.status,
      headers: responseHeaders,
    });
  },
};
