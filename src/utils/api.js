// football-data.org API — free tier
// Get your free key at: https://www.football-data.org/client/register
// In dev, use Vite proxy (/fbd → api.football-data.org/v4) to bypass CORS on localhost:5173
// In prod (GitHub Pages), call the API directly — github.io origins are allowed
const BASE = import.meta.env.DEV ? '/fbd' : 'https://api.football-data.org/v4';

// Competition metadata
export const COMPETITIONS = {
  PL:  { name: 'Premier League',   country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#3D195B', abbr: 'EPL' },
  PD:  { name: 'La Liga',          country: 'Spain',   flag: '🇪🇸', color: '#EE1C25', abbr: 'LAL' },
  BL1: { name: 'Bundesliga',       country: 'Germany', flag: '🇩🇪', color: '#D20515', abbr: 'BUN' },
  SA:  { name: 'Serie A',          country: 'Italy',   flag: '🇮🇹', color: '#008FD7', abbr: 'SA' },
  FL1: { name: 'Ligue 1',          country: 'France',  flag: '🇫🇷', color: '#003189', abbr: 'L1' },
  CL:  { name: 'Champions League', country: 'Europe',  flag: '🏆', color: '#062B79', abbr: 'UCL' },
  WC:  { name: 'World Cup',        country: 'World',   flag: '🌍', color: '#326295', abbr: 'WC' },
};

// Cache
const cache = new Map();
// In-flight dedup
const inflight = new Map();

// Header-based throttle state (as recommended by football-data.org)
// https://www.football-data.org/documentation/api#response-headers
let requestsAvailable = 10;     // X-Requests-Available-Minute
let resetInSeconds    = 60;     // X-RequestCounter-Reset
let lastResetCheck    = 0;
let requestQueue      = Promise.resolve();

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseThrottleHeaders(res) {
  const avail = res.headers.get('X-Requests-Available-Minute');
  const reset = res.headers.get('X-RequestCounter-Reset');
  if (avail !== null) requestsAvailable = parseInt(avail, 10);
  if (reset  !== null) resetInSeconds   = parseInt(reset, 10);
  lastResetCheck = Date.now();
}

async function throttle() {
  // If we know we have requests available, fire immediately
  if (requestsAvailable > 1) return;

  // If near the limit, wait until the counter resets
  const elapsed = (Date.now() - lastResetCheck) / 1000;
  const waitSec = Math.max(0, resetInSeconds - elapsed + 1);
  if (waitSec > 0) {
    console.info(`[MATCHDAY] Rate limit: waiting ${waitSec.toFixed(1)}s for counter reset`);
    await sleep(waitSec * 1000);
    requestsAvailable = 10; // Reset assumption after waiting
  }
}

async function fetchDirect(url, apiKey) {
  const res = await fetch(url, {
    headers: { 'X-Auth-Token': apiKey }
  });

  // Always read throttle headers so we stay ahead of the limiter
  parseThrottleHeaders(res);

  if (res.status === 429) {
    // Hard rate-limit hit — wait for reset then retry once
    const waitSec = Math.max(resetInSeconds, 60);
    console.warn(`[MATCHDAY] 429 received, waiting ${waitSec}s`);
    await sleep(waitSec * 1000);
    requestsAvailable = 10;
    const retry = await fetch(url, { headers: { 'X-Auth-Token': apiKey } });
    parseThrottleHeaders(retry);
    if (!retry.ok) throw new Error(`HTTP ${retry.status}`);
    return retry.json();
  }
  if (res.status === 403) throw new Error('Invalid API key — check your token');
  if (res.status === 404) throw new Error('Competition not found for free tier');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  requestsAvailable = Math.max(0, requestsAvailable - 1);
  return res.json();
}

export async function get(path, apiKey, ttl = 60_000) {
  const url = `${BASE}${path}`;

  // Cache hit
  const hit = cache.get(url);
  if (hit && Date.now() - hit.ts < ttl) return hit.data;

  // Dedup in-flight requests
  if (inflight.has(url)) return inflight.get(url);

  // Serialize requests through a queue so concurrent calls
  // don't all fire at once and blow the rate limit
  const promise = requestQueue = requestQueue
    .then(async () => {
      // Re-check cache (may have been filled while queued)
      const cached = cache.get(url);
      if (cached && Date.now() - cached.ts < ttl) return cached.data;

      await throttle();
      const data = await fetchDirect(url, apiKey);
      cache.set(url, { data, ts: Date.now() });
      inflight.delete(url);
      return data;
    })
    .catch(err => {
      inflight.delete(url);
      throw err;
    });

  inflight.set(url, promise);
  return promise;
}

// ── Standings ──────────────────────────────────────────────
export async function getStandings(competition, apiKey) {
  const data = await get(`/competitions/${competition}/standings`, apiKey, 300_000);
  return data?.standings ?? [];
}

// ── Matches ────────────────────────────────────────────────
export async function getRecentResults(competition, apiKey, limit = 10) {
  try {
    const data = await get(
      `/competitions/${competition}/matches?status=FINISHED&limit=${limit}`,
      apiKey, 120_000
    );
    return (data?.matches ?? []).sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));
  } catch { return []; }
}

export async function getUpcomingFixtures(competition, apiKey, limit = 10) {
  try {
    const data = await get(
      `/competitions/${competition}/matches?status=SCHEDULED,TIMED&limit=${limit}`,
      apiKey, 300_000
    );
    return (data?.matches ?? []).sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  } catch { return []; }
}

export async function getLiveMatches(apiKey) {
  try {
    const codes = Object.keys(COMPETITIONS).join(',');
    const data = await get(
      `/matches?competitions=${codes}&status=IN_PLAY,PAUSED`,
      apiKey, 30_000
    );
    return data?.matches ?? [];
  } catch { return []; }
}

export async function getTodayMatches(apiKey) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const codes = Object.keys(COMPETITIONS).join(',');
    const data = await get(
      `/matches?competitions=${codes}&dateFrom=${today}&dateTo=${today}`,
      apiKey, 60_000
    );
    return data?.matches ?? [];
  } catch { return []; }
}

export async function getMatchesByDateRange(competition, apiKey, from, to) {
  try {
    const comp = competition !== 'ALL' ? `&competitions=${competition}` : `&competitions=${Object.keys(COMPETITIONS).join(',')}`;
    const data = await get(
      `/matches?dateFrom=${from}&dateTo=${to}${comp}`,
      apiKey, 180_000
    );
    return data?.matches ?? [];
  } catch { return []; }
}

export async function getCompetitionMatches(competition, apiKey) {
  try {
    const data = await get(
      `/competitions/${competition}/matches`,
      apiKey, 120_000
    );
    return data?.matches ?? [];
  } catch { return []; }
}

// ── Scorers ────────────────────────────────────────────────
export async function getTopScorers(competition, apiKey, limit = 20) {
  try {
    const data = await get(
      `/competitions/${competition}/scorers?limit=${limit}`,
      apiKey, 300_000
    );
    return data?.scorers ?? [];
  } catch { return []; }
}

// ── Teams ──────────────────────────────────────────────────
export async function getTeams(competition, apiKey) {
  try {
    const data = await get(
      `/competitions/${competition}/teams`,
      apiKey, 3_600_000
    );
    return data?.teams ?? [];
  } catch { return []; }
}

export async function getTeamMatches(teamId, apiKey, limit = 10) {
  try {
    const data = await get(
      `/teams/${teamId}/matches?status=FINISHED&limit=${limit}`,
      apiKey, 120_000
    );
    return (data?.matches ?? []).sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));
  } catch { return []; }
}

// ── Helpers ────────────────────────────────────────────────
export function formatDate(utcDate) {
  return new Date(utcDate).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  });
}

export function formatTime(utcDate) {
  return new Date(utcDate).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit'
  });
}

export function formatKickoff(utcDate) {
  const d = new Date(utcDate);
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) => a.toDateString() === b.toDateString();
  const prefix = isSameDay(d, today) ? 'Today'
    : isSameDay(d, tomorrow) ? 'Tomorrow'
    : isSameDay(d, yesterday) ? 'Yesterday'
    : formatDate(utcDate);

  return `${prefix} · ${formatTime(utcDate)}`;
}

export function getMatchStatus(match) {
  const s = match.status;
  if (s === 'IN_PLAY') return 'live';
  if (s === 'PAUSED') return 'live';
  if (s === 'FINISHED') return 'finished';
  if (s === 'SCHEDULED' || s === 'TIMED') return 'scheduled';
  return 'other';
}

export function getScore(match) {
  const { fullTime } = match.score ?? {};
  if (fullTime?.home != null) return `${fullTime.home} - ${fullTime.away}`;
  const { halfTime } = match.score ?? {};
  if (halfTime?.home != null) return `${halfTime.home} - ${halfTime.away}`;
  return 'vs';
}

export function getTeamCrest(team) {
  return team?.crest ?? null;
}

export function buildFormArray(team, allMatches) {
  if (!allMatches?.length) return [];
  const finished = allMatches
    .filter(m => m.status === 'FINISHED' &&
      (m.homeTeam?.id === team.id || m.awayTeam?.id === team.id))
    .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
    .slice(0, 5);
  return finished.map(m => {
    const isHome = m.homeTeam?.id === team.id;
    const g = m.score?.fullTime ?? {};
    const teamGoals = isHome ? g.home : g.away;
    const oppGoals = isHome ? g.away : g.home;
    if (teamGoals > oppGoals) return 'W';
    if (teamGoals < oppGoals) return 'L';
    return 'D';
  });
}

// Seasons list
export function getSeasonsList() {
  const y = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => y - i);
}
