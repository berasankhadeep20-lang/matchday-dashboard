import React from 'react';
import { getMatchStatus, getScore, formatKickoff, COMPETITIONS } from '../utils/api';

function TeamCrest({ crest, name, size = 20 }) {
  if (crest) return (
    <img src={crest} alt={name} width={size} height={size}
      className="object-contain"
      onError={e => { e.target.style.display = 'none'; }}
    />
  );
  return (
    <div className="flex items-center justify-center text-pitch-muted font-display font-bold text-xs"
      style={{ width: size, height: size }}>
      {name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function MatchCard({ match, compact = false }) {
  const status = getMatchStatus(match);
  const score = getScore(match);
  const isLive = status === 'live';
  const isFinished = status === 'finished';

  const homeGoals = match.score?.fullTime?.home ?? match.score?.halfTime?.home;
  const awayGoals = match.score?.fullTime?.away ?? match.score?.halfTime?.away;
  const homeWin = homeGoals != null && homeGoals > awayGoals;
  const awayWin = homeGoals != null && awayGoals > homeGoals;

  const comp = COMPETITIONS[match.competition?.code];

  if (compact) {
    return (
      <div className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors hover:bg-pitch-card-alt ${isLive ? 'border-l-2 border-neon bg-neon/5' : ''}`}>
        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-neon live-dot shrink-0" />}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <TeamCrest crest={match.homeTeam?.crest} name={match.homeTeam?.shortName} size={16} />
          <span className={`font-display font-semibold text-sm truncate ${homeWin ? 'text-text-bright' : isFinished ? 'text-pitch-muted' : 'text-text-bright'}`}>
            {match.homeTeam?.shortName ?? match.homeTeam?.name}
          </span>
        </div>
        <div className={`num font-bold text-sm px-2 py-0.5 rounded min-w-14 text-center ${
          isLive ? 'text-neon bg-neon/10' : isFinished ? 'text-text-bright' : 'text-pitch-muted'
        }`}>
          {isFinished || isLive ? score : formatTime(match.utcDate)}
        </div>
        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
          <span className={`font-display font-semibold text-sm truncate text-right ${awayWin ? 'text-text-bright' : isFinished ? 'text-pitch-muted' : 'text-text-bright'}`}>
            {match.awayTeam?.shortName ?? match.awayTeam?.name}
          </span>
          <TeamCrest crest={match.awayTeam?.crest} name={match.awayTeam?.shortName} size={16} />
        </div>
      </div>
    );
  }

  return (
    <div className={`md-card p-4 animate-slide-up ${isLive ? 'border-neon/30 neon-glow' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {comp && <span className="text-xs">{comp.flag}</span>}
          <span className="text-pitch-muted font-mono text-xs">
            {match.competition?.name}
          </span>
          {match.matchday && (
            <span className="text-pitch-muted font-mono text-xs">· MD{match.matchday}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-neon live-dot" />}
          <span className={`font-mono text-xs ${isLive ? 'text-neon' : isFinished ? 'text-pitch-muted' : 'text-text-bright'}`}>
            {isLive ? 'LIVE' : isFinished ? 'FT' : formatKickoff(match.utcDate)}
          </span>
        </div>
      </div>

      {/* Score row */}
      <div className="flex items-center gap-4">
        {/* Home */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TeamCrest crest={match.homeTeam?.crest} name={match.homeTeam?.shortName} size={24} />
          <span className={`font-display font-bold text-base truncate ${homeWin ? 'text-text-bright' : 'text-pitch-muted'}`}>
            {match.homeTeam?.name}
          </span>
        </div>

        {/* Score */}
        <div className={`num font-black text-2xl min-w-20 text-center ${isLive ? 'text-neon' : 'text-text-bright'}`}>
          {isFinished || isLive ? score : (
            <span className="text-pitch-muted text-sm font-mono">{formatTime(match.utcDate)}</span>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className={`font-display font-bold text-base truncate text-right ${awayWin ? 'text-text-bright' : 'text-pitch-muted'}`}>
            {match.awayTeam?.name}
          </span>
          <TeamCrest crest={match.awayTeam?.crest} name={match.awayTeam?.shortName} size={24} />
        </div>
      </div>

      {/* Extra time / penalties */}
      {match.score?.duration === 'EXTRA_TIME' && (
        <p className="text-center text-pitch-muted font-mono text-xs mt-2">AET</p>
      )}
      {match.score?.duration === 'PENALTY_SHOOTOUT' && (
        <p className="text-center text-pitch-muted font-mono text-xs mt-2">
          PSO — {match.score?.penalties?.home ?? 0} : {match.score?.penalties?.away ?? 0}
        </p>
      )}
    </div>
  );
}

function formatTime(utcDate) {
  return new Date(utcDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
