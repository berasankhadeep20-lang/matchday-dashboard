import React, { useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { getTeams, getTeamMatches, getStandings, buildFormArray, COMPETITIONS } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useMultiData, useFootballData } from '../hooks/useFootballData';
import { CardLoader, ErrorCard, SectionHeader, Skeleton } from '../components/LoadingCard';

function FormBadge({ result }) {
  const cls = result === 'W' ? 'result-W' : result === 'L' ? 'result-L' : 'result-D';
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-mono font-bold ${cls}`}>
      {result}
    </span>
  );
}

function TeamDetail({ team, standingEntry }) {
  const { apiKey } = useApp();
  const { data: matches, loading } = useFootballData(
    () => getTeamMatches(team.id, apiKey, 8),
    [team.id], 120_000
  );

  const form = buildFormArray(team, matches ?? []);
  const wins = standingEntry?.won ?? 0;
  const draws = standingEntry?.draw ?? 0;
  const losses = standingEntry?.lost ?? 0;
  const total = wins + draws + losses || 1;

  const radarData = [
    { metric: 'Attack', value: Math.round(((standingEntry?.goalsFor ?? 0) / Math.max(standingEntry?.playedGames ?? 1, 1)) * 20) },
    { metric: 'Defence', value: Math.max(0, 100 - Math.round(((standingEntry?.goalsAgainst ?? 0) / Math.max(standingEntry?.playedGames ?? 1, 1)) * 25)) },
    { metric: 'Form', value: form.filter(r => r === 'W').length * 20 },
    { metric: 'Consistency', value: Math.round((wins / total) * 100) },
    { metric: 'Home', value: Math.min(100, (standingEntry?.won ?? 0) * 10) },
    { metric: 'Goals', value: Math.min(100, (standingEntry?.goalsFor ?? 0) * 2) },
  ];

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="md-card p-5 flex items-center gap-4">
        {team.crest && (
          <img src={team.crest} alt={team.name} width={56} height={56}
            className="object-contain"
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
        <div className="flex-1">
          <h2 className="font-display font-black text-2xl text-text-bright">{team.name}</h2>
          <p className="text-pitch-muted font-mono text-xs">
            {team.area?.name} · Est. {team.founded ?? '—'}
          </p>
          {team.venue && <p className="text-pitch-muted font-mono text-xs">{team.venue}</p>}
        </div>
        {standingEntry && (
          <div className="text-right">
            <p className="num font-black text-3xl text-neon">{standingEntry.points}</p>
            <p className="text-pitch-muted font-mono text-xs">pts · P{standingEntry.position}</p>
          </div>
        )}
      </div>

      {/* Stats grid */}
      {standingEntry && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Played', value: standingEntry.playedGames },
            { label: 'Won', value: standingEntry.won, color: 'text-neon' },
            { label: 'Drawn', value: standingEntry.draw, color: 'text-draw' },
            { label: 'Lost', value: standingEntry.lost, color: 'text-loss' },
            { label: 'Goals For', value: standingEntry.goalsFor, color: 'text-goal' },
            { label: 'Goals Against', value: standingEntry.goalsAgainst },
            { label: 'Goal Diff', value: (standingEntry.goalDifference > 0 ? '+' : '') + standingEntry.goalDifference, color: standingEntry.goalDifference >= 0 ? 'text-neon' : 'text-loss' },
            { label: 'Clean Sheets', value: '—' },
          ].map(s => (
            <div key={s.label} className="md-card p-3 text-center">
              <p className="text-pitch-muted font-mono text-[10px] uppercase mb-1">{s.label}</p>
              <p className={`num font-bold text-xl ${s.color ?? 'text-text-bright'}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Radar */}
        <div className="md-card p-4">
          <SectionHeader title="Performance Radar" />
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1E2C27" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#5C7A6E', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Radar dataKey="value" stroke="#00FF87" fill="#00FF87" fillOpacity={0.15} />
              <Tooltip contentStyle={{ background: '#111816', border: '1px solid #1E2C27', borderRadius: 8 }} labelStyle={{ color: '#EDF5F0' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent form */}
        <div className="md-card p-4">
          <SectionHeader title="Recent Form" subtitle="Last 5 matches" />
          {loading ? <Skeleton className="h-32" /> : (
            <div className="space-y-2">
              <div className="flex gap-1.5 mb-4">
                {form.length ? form.map((r, i) => <FormBadge key={i} result={r} />) : (
                  <p className="text-pitch-muted font-mono text-xs">No recent matches</p>
                )}
              </div>
              {(matches ?? []).slice(0, 5).map(match => {
                const isHome = match.homeTeam?.id === team.id;
                const opp = isHome ? match.awayTeam : match.homeTeam;
                const hg = match.score?.fullTime?.home;
                const ag = match.score?.fullTime?.away;
                const tg = isHome ? hg : ag;
                const og = isHome ? ag : hg;
                const result = tg > og ? 'W' : tg < og ? 'L' : 'D';
                return (
                  <div key={match.id} className="flex items-center gap-3 py-1.5 border-b border-pitch-border/30">
                    <FormBadge result={result} />
                    <div className="flex items-center gap-1.5">
                      {opp?.crest && <img src={opp.crest} alt="" width={14} height={14} className="object-contain" onError={e => { e.target.style.display = 'none'; }} />}
                      <span className="text-text-bright font-display font-semibold text-sm">{opp?.shortName ?? opp?.name}</span>
                    </div>
                    <span className="num text-pitch-muted text-xs ml-auto">{tg} - {og}</span>
                    <span className="text-pitch-muted font-mono text-[10px]">{isHome ? 'H' : 'A'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const { competition, apiKey } = useApp();
  const [selectedTeam, setSelectedTeam] = useState(null);

  const { data, loading, error } = useMultiData({
    teams: () => getTeams(competition, apiKey),
    standings: () => getStandings(competition, apiKey),
  }, [competition, apiKey], null);

  if (loading) return <CardLoader rows={10} />;
  if (error) return <ErrorCard message={error} />;

  const teams = data.teams ?? [];
  const table = data.standings?.find(s => s.type === 'TOTAL')?.table ?? [];
  const standingMap = {};
  table.forEach(e => { standingMap[e.team?.id] = e; });

  const comp = COMPETITIONS[competition];

  const team = selectedTeam
    ? teams.find(t => t.id === selectedTeam)
    : null;

  return (
    <div className="space-y-4">
      {/* Team picker */}
      <div className="md-card p-4">
        <SectionHeader title={`${comp?.flag ?? ''} ${comp?.name ?? competition} — Teams`} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {teams.map(t => {
            const isSelected = selectedTeam === t.id;
            const standing = standingMap[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeam(isSelected ? null : t.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-neon bg-neon/8 neon-glow'
                    : 'border-pitch-border hover:border-pitch-muted bg-pitch-card-alt/40'
                }`}
              >
                {t.crest && (
                  <img src={t.crest} alt={t.shortName} width={32} height={32}
                    className="object-contain"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
                <span className="text-text-bright font-display font-semibold text-xs text-center leading-tight">
                  {t.shortName ?? t.name}
                </span>
                {standing && (
                  <span className="text-pitch-muted font-mono text-[10px]">
                    P{standing.position} · {standing.points}pts
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {team && <TeamDetail team={team} standingEntry={standingMap[team.id]} />}
    </div>
  );
}
