import React from 'react';
import { getRecentResults, getUpcomingFixtures, formatDate, formatTime, getScore, getMatchStatus, COMPETITIONS } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useFootballData } from '../hooks/useFootballData';
import { CardLoader, ErrorCard, SectionHeader } from './LoadingCard';

function TeamRow({ crest, name, goals, isWinner, isHome }) {
  return (
    <div className={`flex items-center gap-2 ${isHome ? '' : 'flex-row-reverse'}`}>
      {crest && (
        <img src={crest} alt={name} width={16} height={16}
          className="object-contain shrink-0"
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      <span className={`font-display font-semibold text-sm truncate max-w-28 ${isWinner ? 'text-text-bright' : 'text-pitch-muted'}`}>
        {name}
      </span>
    </div>
  );
}

export default function MatchList({ mode = 'results', limit = 8, compact = false }) {
  const { competition, apiKey } = useApp();

  const { data, loading, error } = useFootballData(
    () => mode === 'results'
      ? getRecentResults(competition, apiKey, limit)
      : getUpcomingFixtures(competition, apiKey, limit),
    [competition, apiKey, mode],
    mode === 'results' ? 120_000 : 300_000
  );

  if (loading) return <CardLoader rows={compact ? 4 : limit} />;
  if (error) return <ErrorCard message={error} />;
  if (!data?.length) return (
    <div className="md-card p-6 text-center">
      <p className="text-pitch-muted font-mono text-sm">
        {mode === 'results' ? 'No recent results' : 'No upcoming fixtures'}
      </p>
    </div>
  );

  const comp = COMPETITIONS[competition];

  return (
    <div className="md-card overflow-hidden animate-slide-up">
      <div className="p-4 border-b border-pitch-border">
        <SectionHeader
          title={mode === 'results' ? 'Recent Results' : 'Upcoming Fixtures'}
          subtitle={`${comp?.flag ?? ''} ${comp?.name ?? competition}`}
        />
      </div>
      <div className="divide-y divide-pitch-border/40">
        {data.map(match => {
          const status = getMatchStatus(match);
          const isFinished = status === 'finished';
          const isLive = status === 'live';

          const hg = match.score?.fullTime?.home;
          const ag = match.score?.fullTime?.away;
          const homeWin = hg != null && hg > ag;
          const awayWin = ag != null && ag > hg;

          return (
            <div key={match.id}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-pitch-card-alt/60 transition-colors ${isLive ? 'border-l-2 border-neon bg-neon/5' : ''}`}>

              {/* Date / status */}
              <div className="w-16 shrink-0 text-center">
                {isLive ? (
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon live-dot" />
                    <span className="text-neon font-mono text-xs font-bold">LIVE</span>
                  </div>
                ) : isFinished ? (
                  <div>
                    <p className="text-pitch-muted font-mono text-[10px]">{formatDate(match.utcDate)}</p>
                    <p className="text-pitch-muted font-mono text-[10px]">FT</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-pitch-muted font-mono text-[10px]">{formatDate(match.utcDate)}</p>
                    <p className="text-text-bright font-mono text-xs">{formatTime(match.utcDate)}</p>
                  </div>
                )}
              </div>

              {/* Home team */}
              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <span className={`font-display font-semibold text-sm truncate ${homeWin ? 'text-text-bright' : isFinished ? 'text-pitch-muted' : 'text-text-bright'}`}>
                  {match.homeTeam?.shortName ?? match.homeTeam?.name}
                </span>
                {match.homeTeam?.crest && (
                  <img src={match.homeTeam.crest} alt="" width={18} height={18}
                    className="object-contain shrink-0"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>

              {/* Score / vs */}
              <div className={`num font-black text-lg min-w-16 text-center shrink-0 ${
                isLive ? 'text-neon' : isFinished ? 'text-text-bright' : 'text-pitch-muted'
              }`}>
                {isFinished || isLive ? getScore(match) : 'vs'}
              </div>

              {/* Away team */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {match.awayTeam?.crest && (
                  <img src={match.awayTeam.crest} alt="" width={18} height={18}
                    className="object-contain shrink-0"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
                <span className={`font-display font-semibold text-sm truncate ${awayWin ? 'text-text-bright' : isFinished ? 'text-pitch-muted' : 'text-text-bright'}`}>
                  {match.awayTeam?.shortName ?? match.awayTeam?.name}
                </span>
              </div>

              {/* Matchday */}
              {match.matchday && (
                <span className="text-pitch-muted font-mono text-[10px] shrink-0 hidden sm:block">
                  MD{match.matchday}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
