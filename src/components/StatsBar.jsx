import React from 'react';
import { getStandings, getTopScorers, getTodayMatches, getLiveMatches } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useMultiData } from '../hooks/useFootballData';

function StatBox({ label, value, sub, accent }) {
  return (
    <div className="md-card md-card-hover p-4 flex-1 min-w-0">
      <p className="text-pitch-muted font-mono text-[10px] uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-display font-black text-2xl leading-tight truncate ${accent ? 'text-neon' : 'text-text-bright'}`}>
        {value ?? '—'}
      </p>
      {sub && <p className="text-pitch-muted font-mono text-xs mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

export default function StatsBar() {
  const { competition, apiKey } = useApp();

  const { data, loading } = useMultiData({
    standings: () => getStandings(competition, apiKey),
    scorers:   () => getTopScorers(competition, apiKey, 1),
    live:      () => getLiveMatches(apiKey),
    today:     () => getTodayMatches(apiKey),
  }, [competition, apiKey], 60_000);

  if (loading) return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {[1,2,3,4].map(i => (
        <div key={i} className="md-card flex-1 min-w-32 h-20 shimmer" />
      ))}
    </div>
  );

  const table = data.standings?.find(s => s.type === 'TOTAL')?.table ?? [];
  const leader = table[0];
  const p2 = table[1];
  const gap = leader && p2 ? leader.points - p2.points : null;

  const topScorer = data.scorers?.[0];
  const goals = topScorer?.goals ?? topScorer?.scorer?.goals;

  const liveCount = data.live?.length ?? 0;
  const todayCount = data.today?.length ?? 0;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 animate-slide-up">
      <StatBox
        label="League Leader"
        value={leader?.team?.shortName ?? leader?.team?.name ?? '—'}
        sub={`${leader?.points ?? 0} pts${gap != null ? ` · +${gap} clear` : ''}`}
        accent
      />
      <StatBox
        label="Top Scorer"
        value={topScorer?.player?.name?.split(' ').pop() ?? '—'}
        sub={`${goals ?? 0} goals · ${topScorer?.team?.shortName ?? ''}`}
      />
      <StatBox
        label="Live Matches"
        value={liveCount > 0 ? liveCount : '—'}
        sub={liveCount > 0 ? 'In play now' : 'No live games'}
        accent={liveCount > 0}
      />
      <StatBox
        label="Today"
        value={todayCount > 0 ? todayCount : '—'}
        sub={todayCount > 0 ? `${todayCount} match${todayCount > 1 ? 'es' : ''} today` : 'No fixtures'}
      />
    </div>
  );
}
