import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { getStandings } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useFootballData } from '../hooks/useFootballData';
import { SectionHeader, ErrorCard } from './LoadingCard';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="md-card p-3 shadow-xl border-pitch-border">
      <p className="text-text-bright font-display font-semibold text-sm mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
            <span className="text-pitch-muted font-mono text-xs">{p.name}</span>
          </div>
          <span className="num text-text-bright text-xs font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function GoalsChart() {
  const { competition, apiKey } = useApp();

  const { data, loading, error } = useFootballData(
    () => getStandings(competition, apiKey),
    [competition, apiKey],
    300_000
  );

  if (loading) return (
    <div className="md-card p-4">
      <SectionHeader title="Goals Overview" />
      <div className="h-56 shimmer rounded mt-2" />
    </div>
  );
  if (error) return <ErrorCard message={error} />;

  const table = data?.find(s => s.type === 'TOTAL')?.table ?? [];
  const chartData = table.slice(0, 12).map(entry => ({
    team: entry.team?.shortName ?? entry.team?.name?.slice(0, 8),
    scored: entry.goalsFor,
    conceded: entry.goalsAgainst,
    gd: entry.goalDifference,
  }));

  return (
    <div className="md-card p-4 animate-slide-up">
      <SectionHeader title="Goals: Scored vs Conceded" subtitle="Top 12 teams" />
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 4, right: 10, left: -20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2C27" />
          <XAxis
            dataKey="team"
            tick={{ fill: '#5C7A6E', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            angle={-35}
            textAnchor="end"
          />
          <YAxis tick={{ fill: '#5C7A6E', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="scored" name="Scored" radius={[3, 3, 0, 0]} barSize={10}>
            {chartData.map((_, i) => <Cell key={i} fill="#00FF87" fillOpacity={0.85} />)}
          </Bar>
          <Bar dataKey="conceded" name="Conceded" radius={[3, 3, 0, 0]} barSize={10}>
            {chartData.map((_, i) => <Cell key={i} fill="#FF4040" fillOpacity={0.75} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
