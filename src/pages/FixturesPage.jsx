import React, { useState } from 'react';
import { getMatchesByDateRange, COMPETITIONS, formatDate, formatTime, getScore, getMatchStatus } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useFootballData } from '../hooks/useFootballData';
import { CardLoader, ErrorCard, SectionHeader } from '../components/LoadingCard';

function getWeekRange(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset * 7);
  const from = new Date(d);
  from.setDate(d.getDate() - d.getDay() + 1);
  const to = new Date(from);
  to.setDate(from.getDate() + 6);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
    label: offset === 0 ? 'This Week' : offset === 1 ? 'Next Week' : offset === -1 ? 'Last Week' : `Week ${offset > 0 ? '+' : ''}${offset}`,
  };
}

function MatchRow({ match }) {
  const status = getMatchStatus(match);
  const isLive = status === 'live';
  const isFinished = status === 'finished';
  const hg = match.score?.fullTime?.home;
  const ag = match.score?.fullTime?.away;
  const homeWin = hg != null && hg > ag;
  const awayWin = ag != null && ag > hg;
  const comp = COMPETITIONS[match.competition?.code];

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-pitch-border/40 hover:bg-pitch-card-alt/60 transition-colors ${isLive ? 'border-l-2 border-neon bg-neon/5' : ''}`}>
      {/* Competition */}
      <div className="w-8 text-center shrink-0">
        {comp?.flag && <span className="text-base">{comp.flag}</span>}
      </div>

      {/* Time */}
      <div className="w-14 shrink-0 text-center">
        {isLive ? (
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neon live-dot" />
            <span className="text-neon font-mono text-xs">LIVE</span>
          </div>
        ) : isFinished ? (
          <span className="text-pitch-muted font-mono text-xs">FT</span>
        ) : (
          <span className="text-text-bright font-mono text-xs">{formatTime(match.utcDate)}</span>
        )}
      </div>

      {/* Home */}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        {match.homeTeam?.crest && (
          <img src={match.homeTeam.crest} alt="" width={18} height={18}
            className="object-contain shrink-0"
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
        <span className={`font-display font-semibold text-sm truncate ${homeWin ? 'text-text-bright' : isFinished ? 'text-pitch-muted' : 'text-text-bright'}`}>
          {match.homeTeam?.shortName ?? match.homeTeam?.name}
        </span>
      </div>

      {/* Score */}
      <div className={`num font-black text-lg min-w-16 text-center shrink-0 ${isLive ? 'text-neon' : isFinished ? 'text-text-bright' : 'text-pitch-muted'}`}>
        {isFinished || isLive ? getScore(match) : 'vs'}
      </div>

      {/* Away */}
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

      {/* Stadium */}
      {match.venue && (
        <span className="text-pitch-muted font-mono text-[10px] hidden xl:block truncate max-w-28 shrink-0">
          {match.venue}
        </span>
      )}
    </div>
  );
}

export default function FixturesPage() {
  const { competition, apiKey } = useApp();
  const [weekOffset, setWeekOffset] = useState(0);
  const range = getWeekRange(weekOffset);

  const { data: matches, loading, error } = useFootballData(
    () => getMatchesByDateRange(competition, apiKey, range.from, range.to),
    [competition, apiKey, range.from],
    120_000
  );

  // Group by date
  const grouped = {};
  (matches ?? []).forEach(m => {
    const d = m.utcDate.split('T')[0];
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(m);
  });

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-4">
      {/* Week navigator */}
      <div className="md-card p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="px-3 py-1.5 rounded border border-pitch-border text-pitch-muted hover:text-text-bright hover:border-pitch-muted transition-colors font-mono text-xs"
          >← Prev</button>
          <div className="text-center">
            <p className="text-text-bright font-display font-bold text-base">{range.label}</p>
            <p className="text-pitch-muted font-mono text-xs">{range.from} — {range.to}</p>
          </div>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="px-3 py-1.5 rounded border border-pitch-border text-pitch-muted hover:text-text-bright hover:border-pitch-muted transition-colors font-mono text-xs"
          >Next →</button>
        </div>
        <button
          onClick={() => setWeekOffset(0)}
          className="px-4 py-1.5 rounded bg-neon/10 border border-neon/30 text-neon font-mono text-xs hover:bg-neon/20 transition-colors"
        >
          Today
        </button>
      </div>

      {loading && <CardLoader rows={8} />}
      {error && <ErrorCard message={error} />}
      {!loading && !error && sortedDates.length === 0 && (
        <div className="md-card p-10 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-pitch-muted font-mono">No matches this week</p>
        </div>
      )}

      {sortedDates.map(date => (
        <div key={date} className="md-card overflow-hidden animate-slide-up">
          <div className="px-4 py-2.5 border-b border-pitch-border bg-pitch-card-alt/50">
            <p className="text-text-bright font-display font-bold text-sm">
              {formatDate(date + 'T12:00:00Z')}
            </p>
          </div>
          {grouped[date].map(match => (
            <MatchRow key={match.id} match={match} />
          ))}
        </div>
      ))}
    </div>
  );
}
