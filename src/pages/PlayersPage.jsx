import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { getTopScorers, COMPETITIONS } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useFootballData } from '../hooks/useFootballData';
import { CardLoader, ErrorCard, SectionHeader } from '../components/LoadingCard';

const COLORS = ['#F5C842','#00FF87','#00C864','#3671C6','#FF8000','#FF87BC','#00DDBB','#9966FF','#FF5555','#AAAAAA'];

export default function PlayersPage() {
  const { competition, apiKey } = useApp();
  const [view, setView] = useState('goals'); // goals | assists | chart
  const comp = COMPETITIONS[competition];

  const { data, loading, error } = useFootballData(
    () => getTopScorers(competition, apiKey, 20),
    [competition, apiKey],
    300_000
  );

  if (loading) return <CardLoader rows={20} />;
  if (error) return <ErrorCard message={error} />;
  if (!data?.length) return (
    <div className="md-card p-10 text-center">
      <p className="text-pitch-muted font-mono">No scorer data available for {comp?.name}</p>
    </div>
  );

  const maxGoals = data[0]?.goals ?? data[0]?.scorer?.goals ?? 1;

  const chartData = data.slice(0, 15).map((entry, i) => ({
    name: entry.player?.name?.split(' ').pop() ?? `Player ${i+1}`,
    goals: entry.goals ?? entry.scorer?.goals ?? 0,
    assists: entry.assists ?? 0,
    team: entry.team?.shortName,
    color: COLORS[i % COLORS.length],
  }));

  const sorted = view === 'assists'
    ? [...data].sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0))
    : data;

  return (
    <div className="space-y-4">
      {/* Header + tabs */}
      <div className="md-card p-4 flex items-start justify-between flex-wrap gap-3">
        <SectionHeader
          title="Player Stats"
          subtitle={`${comp?.flag ?? ''} ${comp?.name ?? competition}`}
        />
        <div className="flex bg-pitch rounded overflow-hidden border border-pitch-border">
          {[['goals','⚽ Goals'],['assists','🎯 Assists'],['chart','📊 Chart']].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)}
              className={`px-3 py-1.5 text-xs font-display font-semibold uppercase transition-all ${view === id ? 'bg-neon text-pitch' : 'text-pitch-muted'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === 'chart' ? (
        <div className="md-card p-4 animate-slide-up">
          <SectionHeader title="Goals + Assists" subtitle="Top 15 players" />
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 60, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2C27" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#5C7A6E', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <YAxis type="category" dataKey="name" width={80}
                tick={{ fill: '#EDF5F0', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <Tooltip
                formatter={(v, n) => [`${v}`, n]}
                contentStyle={{ background: '#111816', border: '1px solid #1E2C27', borderRadius: 8 }}
                labelStyle={{ color: '#EDF5F0', fontFamily: 'JetBrains Mono' }}
              />
              <Bar dataKey="goals" name="Goals" radius={[0,3,3,0]} barSize={12}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
              <Bar dataKey="assists" name="Assists" radius={[0,3,3,0]} barSize={8} fill="#3671C6" fillOpacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="md-card overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pitch-border">
                  <th className="text-left text-pitch-muted font-mono text-[10px] uppercase px-4 py-2">#</th>
                  <th className="text-left text-pitch-muted font-mono text-[10px] uppercase px-4 py-2">Player</th>
                  <th className="text-left text-pitch-muted font-mono text-[10px] uppercase px-4 py-2 hidden sm:table-cell">Team</th>
                  <th className="text-center text-pitch-muted font-mono text-[10px] uppercase px-4 py-2 hidden md:table-cell">Nat.</th>
                  <th className="text-center text-pitch-muted font-mono text-[10px] uppercase px-4 py-2">
                    {view === 'assists' ? 'Ast' : 'Goals'}
                  </th>
                  <th className="text-center text-pitch-muted font-mono text-[10px] uppercase px-4 py-2 hidden sm:table-cell">
                    {view === 'assists' ? 'Goals' : 'Ast'}
                  </th>
                  <th className="text-center text-pitch-muted font-mono text-[10px] uppercase px-4 py-2 hidden md:table-cell">MP</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry, i) => {
                  const player = entry.player;
                  const team = entry.team;
                  const goals = entry.goals ?? entry.scorer?.goals ?? 0;
                  const assists = entry.assists ?? 0;
                  const pct = (goals / maxGoals) * 100;

                  return (
                    <tr key={player?.id ?? i} className="border-b border-pitch-border/40 hover:bg-pitch-card-alt/60 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`num font-bold text-sm ${i === 0 ? 'text-goal' : i < 3 ? 'text-neon' : 'text-pitch-muted'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-display font-semibold text-sm text-text-bright">
                              {player?.name ?? `${player?.firstName ?? ''} ${player?.lastName ?? ''}`}
                            </p>
                            <div className="h-1 bg-pitch-border rounded-full mt-1 w-20 overflow-hidden hidden sm:block">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: i === 0 ? '#F5C842' : '#00FF87' }} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          {team?.crest && (
                            <img src={team.crest} alt="" width={16} height={16}
                              className="object-contain"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span className="text-pitch-muted text-xs font-body">
                            {team?.shortName ?? team?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className="text-pitch-muted font-mono text-xs">{player?.nationality?.slice(0,3).toUpperCase() ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="num font-bold text-sm text-text-bright">
                            {view === 'assists' ? assists : goals}
                          </span>
                          <span className="text-xs">{view === 'assists' ? '🎯' : '⚽'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="num text-pitch-muted text-xs">
                          {view === 'assists' ? goals : assists}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className="num text-pitch-muted text-xs">{entry.playedMatches ?? '—'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
