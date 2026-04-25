import React from 'react';
import { getLiveMatches, getScore, COMPETITIONS } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useFootballData } from '../hooks/useFootballData';

export default function LiveTicker() {
  const { apiKey } = useApp();

  const { data: matches } = useFootballData(
    () => getLiveMatches(apiKey),
    [apiKey],
    30_000
  );

  if (!matches?.length) return null;

  return (
    <div className="border border-neon/20 bg-neon/5 rounded-lg px-4 py-2 flex items-center gap-4 overflow-x-auto no-scrollbar animate-fade-in">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-2 h-2 rounded-full bg-neon live-dot" />
        <span className="text-neon font-mono text-xs uppercase tracking-widest font-bold">Live</span>
      </div>
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        {matches.map(match => {
          const comp = COMPETITIONS[match.competition?.code];
          return (
            <div key={match.id} className="flex items-center gap-2 shrink-0">
              {comp && <span className="text-xs">{comp.flag}</span>}
              <div className="flex items-center gap-1.5">
                {match.homeTeam?.crest && (
                  <img src={match.homeTeam.crest} alt="" width={14} height={14}
                    className="object-contain"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
                <span className="text-text-bright font-display font-semibold text-xs">
                  {match.homeTeam?.shortName}
                </span>
              </div>
              <span className="num font-bold text-sm text-neon">{getScore(match)}</span>
              <div className="flex items-center gap-1.5">
                {match.awayTeam?.crest && (
                  <img src={match.awayTeam.crest} alt="" width={14} height={14}
                    className="object-contain"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
                <span className="text-text-bright font-display font-semibold text-xs">
                  {match.awayTeam?.shortName}
                </span>
              </div>
              {match.minute && (
                <span className="text-neon font-mono text-[10px]">{match.minute}'</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
