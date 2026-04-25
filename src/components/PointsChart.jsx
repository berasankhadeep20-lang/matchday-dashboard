import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getStandings } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useFootballData } from '../hooks/useFootballData';
import { SectionHeader, ErrorCard } from './LoadingCard';

const COLORS = ['#00FF87','#F5C842','#FF4040','#3671C6','#FF8000','#FF87BC','#00DDBB','#9966FF','#FF5555','#AAAAAA'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const visible = payload.filter(p => p.value !== undefined);
  return (
    <div className="md-card p-3 shadow-xl max-h-60 overflow-y-auto">
      <p className="text-pitch-muted font-mono text-xs mb-2">Matchday {label}</p>
      {[...visible].sort((a, b) => b.value - a.value).map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-text-bright font-mono text-xs">{p.name}</span>
          </div>
          <span className="num text-text-bright text-xs font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function PointsChart() {
  const { competition, apiKey } = useApp();

  const { data, loading, error } = useFootballData(
    () => getStandings(competition, apiKey),
    [competition, apiKey],
    300_000
  );

  if (loading) return (
    <div className="md-card p-4">
      <SectionHeader title="Points Race" />
      <div className="h-72 shimmer rounded mt-2" />
    </div>
  );
  if (error) return <ErrorCard message={error} />;

  const table = data?.find(s => s.type === 'TOTAL')?.table ?? [];
  const top10 = table.slice(0, 10);

  // Build matchday-by-matchday points (approx from total: 3*W + D)
  // We only have season totals, so we simulate a trend using played games
  const maxPlayed = Math.max(...top10.map(e => e.playedGames));
  const chartData = Array.from({ length: maxPlayed }, (_, i) => {
    const md = i + 1;
    const row = { md };
    top10.forEach(entry => {
      if (md <= entry.playedGames) {
        // Approximate cumulative points at matchday md
        const rate = entry.points / entry.playedGames;
        row[entry.team?.shortName] = Math.round(rate * md);
      }
    });
    return row;
  });

  return (
    <div className="md-card p-4 animate-slide-up">
      <SectionHeader title="Points Race" subtitle="Top 10 — approximate progression" />
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2C27" />
          <XAxis dataKey="md" tick={{ fill: '#5C7A6E', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            label={{ value: 'Matchday', position: 'insideBottomRight', offset: 0, fill: '#5C7A6E', fontSize: 10 }} />
          <YAxis tick={{ fill: '#5C7A6E', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
          <Tooltip content={<CustomTooltip />} />
          {top10.map((entry, i) => (
            <Line
              key={entry.team?.id}
              type="monotone"
              dataKey={entry.team?.shortName}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={i === 0 ? 2.5 : 1.5}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
