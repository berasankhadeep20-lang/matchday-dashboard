import React, { useState } from 'react';
import { getStandings, COMPETITIONS } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useFootballData } from '../hooks/useFootballData';
import { CardLoader, ErrorCard, SectionHeader } from './LoadingCard';

function FormBadge({ result }) {
  const cls = result === 'W' ? 'result-W' : result === 'L' ? 'result-L' : 'result-D';
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-mono font-bold ${cls}`}>
      {result}
    </span>
  );
}

function TableRow({ entry, index, compact = false }) {
  const pos = entry.position;
  const team = entry.team;
  const stats = entry;
  const form = (entry.form ?? '').split(',').filter(Boolean).slice(-5);

  const posColor = pos === 1 ? 'text-goal' : pos <= 4 ? 'text-neon' : pos >= stats.lastPos - 2 ? 'text-loss' : 'text-pitch-muted';

  return (
    <tr className="border-b border-pitch-border/40 hover:bg-pitch-card-alt/60 transition-colors group">
      <td className="px-3 py-2.5 w-8">
        <span className={`num font-bold text-sm ${posColor}`}>{pos}</span>
      </td>
      <td className="px-2 py-2.5">
        <div className="flex items-center gap-2">
          {team.crest && (
            <img src={team.crest} alt={team.shortName} width={18} height={18}
              className="object-contain shrink-0"
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}
          <span className="font-display font-semibold text-sm text-text-bright truncate max-w-36">
            {team.shortName || team.name}
          </span>
        </div>
      </td>
      <td className="px-2 py-2.5 text-center hidden sm:table-cell">
        <span className="num text-pitch-muted text-xs">{stats.playedGames}</span>
      </td>
      <td className="px-2 py-2.5 text-center hidden sm:table-cell">
        <span className="num text-neon text-xs">{stats.won}</span>
      </td>
      <td className="px-2 py-2.5 text-center hidden sm:table-cell">
        <span className="num text-draw text-xs">{stats.draw}</span>
      </td>
      <td className="px-2 py-2.5 text-center hidden sm:table-cell">
        <span className="num text-loss text-xs">{stats.lost}</span>
      </td>
      <td className="px-2 py-2.5 text-center hidden md:table-cell">
        <span className="num text-pitch-muted text-xs">
          {stats.goalsFor}:{stats.goalsAgainst}
        </span>
      </td>
      <td className="px-2 py-2.5 text-center hidden md:table-cell">
        <span className={`num text-xs ${stats.goalDifference >= 0 ? 'text-neon' : 'text-loss'}`}>
          {stats.goalDifference > 0 ? '+' : ''}{stats.goalDifference}
        </span>
      </td>
      <td className="px-2 py-2.5 text-center">
        <span className="num font-bold text-sm text-text-bright">{stats.points}</span>
      </td>
      {!compact && (
        <td className="px-2 py-2.5 hidden lg:table-cell">
          <div className="flex gap-0.5">
            {form.map((r, i) => <FormBadge key={i} result={r} />)}
          </div>
        </td>
      )}
    </tr>
  );
}

export default function LeagueTable({ compact = false }) {
  const { competition, apiKey } = useApp();
  const [tableType, setTableType] = useState('TOTAL'); // TOTAL, HOME, AWAY

  const { data, loading, error } = useFootballData(
    () => getStandings(competition, apiKey),
    [competition, apiKey],
    300_000
  );

  if (loading) return <CardLoader rows={compact ? 6 : 20} />;
  if (error) return <ErrorCard message={error} />;

  const standings = data?.find(s => s.type === tableType) ?? data?.[0];
  const table = standings?.table ?? [];

  const comp = COMPETITIONS[competition];

  return (
    <div className="md-card overflow-hidden animate-slide-up">
      <div className="p-4 border-b border-pitch-border">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <SectionHeader
            title={comp?.name ?? competition}
            subtitle={`${comp?.flag ?? ''} ${comp?.country ?? ''} · ${table.length} teams`}
          />
          {!compact && (
            <div className="flex bg-pitch rounded overflow-hidden border border-pitch-border">
              {['TOTAL', 'HOME', 'AWAY'].map(t => (
                <button key={t} onClick={() => setTableType(t)}
                  className={`px-3 py-1 text-xs font-display font-semibold uppercase transition-all ${tableType === t ? 'bg-neon text-pitch' : 'text-pitch-muted'}`}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pitch-border/60">
              <th className="text-left text-pitch-muted font-mono text-[10px] uppercase px-3 py-2">#</th>
              <th className="text-left text-pitch-muted font-mono text-[10px] uppercase px-2 py-2">Team</th>
              <th className="text-center text-pitch-muted font-mono text-[10px] uppercase px-2 py-2 hidden sm:table-cell">P</th>
              <th className="text-center text-pitch-muted font-mono text-[10px] uppercase px-2 py-2 hidden sm:table-cell">W</th>
              <th className="text-center text-pitch-muted font-mono text-[10px] uppercase px-2 py-2 hidden sm:table-cell">D</th>
              <th className="text-center text-pitch-muted font-mono text-[10px] uppercase px-2 py-2 hidden sm:table-cell">L</th>
              <th className="text-center text-pitch-muted font-mono text-[10px] uppercase px-2 py-2 hidden md:table-cell">GF:GA</th>
              <th className="text-center text-pitch-muted font-mono text-[10px] uppercase px-2 py-2 hidden md:table-cell">GD</th>
              <th className="text-center text-pitch-muted font-mono text-[10px] uppercase px-2 py-2">Pts</th>
              {!compact && (
                <th className="text-left text-pitch-muted font-mono text-[10px] uppercase px-2 py-2 hidden lg:table-cell">Form</th>
              )}
            </tr>
          </thead>
          <tbody>
            {(compact ? table.slice(0, 8) : table).map((entry, i) => (
              <TableRow key={entry.team?.id} entry={entry} index={i} compact={compact} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
