import React from 'react';
import { getTopScorers, COMPETITIONS } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useFootballData } from '../hooks/useFootballData';
import { CardLoader, ErrorCard, SectionHeader } from './LoadingCard';

export default function TopScorers({ limit = 10, compact = false }) {
  const { competition, apiKey } = useApp();

  const { data, loading, error } = useFootballData(
    () => getTopScorers(competition, apiKey, limit),
    [competition, apiKey],
    300_000
  );

  if (loading) return <CardLoader rows={compact ? 5 : 10} />;
  if (error) return <ErrorCard message={error} />;
  if (!data?.length) return <ErrorCard message="No scorer data available" />;

  const maxGoals = data[0]?.scorer?.goals ?? 1;

  return (
    <div className="md-card overflow-hidden animate-slide-up">
      <div className="p-4 border-b border-pitch-border">
        <SectionHeader title="Top Scorers" subtitle={COMPETITIONS[competition]?.name} />
      </div>
      <div className="divide-y divide-pitch-border/40">
        {(compact ? data.slice(0, 6) : data).map((entry, i) => {
          const player = entry.player;
          const team = entry.team;
          const goals = entry.goals ?? entry.scorer?.goals ?? 0;
          const assists = entry.assists ?? 0;
          const pct = (goals / maxGoals) * 100;

          return (
            <div key={player?.id ?? i} className="flex items-center gap-3 px-4 py-3 hover:bg-pitch-card-alt/60 transition-colors group">
              {/* Rank */}
              <span className={`num font-bold text-sm w-5 text-center shrink-0 ${i === 0 ? 'text-goal' : i < 3 ? 'text-neon' : 'text-pitch-muted'}`}>
                {i + 1}
              </span>

              {/* Crest */}
              {team?.crest && (
                <img src={team.crest} alt={team.shortName} width={18} height={18}
                  className="object-contain shrink-0"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-display font-semibold text-sm text-text-bright truncate">
                    {player?.name ?? player?.firstName + ' ' + player?.lastName}
                  </span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {assists > 0 && !compact && (
                      <span className="num text-pitch-muted text-xs">{assists}a</span>
                    )}
                    <span className="num font-bold text-sm text-text-bright">{goals}</span>
                    <span className="text-goal text-xs">⚽</span>
                  </div>
                </div>
                {!compact && (
                  <>
                    <div className="text-pitch-muted font-mono text-[10px] mb-1">
                      {team?.shortName ?? team?.name}
                    </div>
                    <div className="h-1 bg-pitch-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: i === 0 ? '#F5C842' : '#00FF87' }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
