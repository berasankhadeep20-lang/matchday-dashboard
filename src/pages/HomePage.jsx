import React from 'react';
import StatsBar from '../components/StatsBar';
import LiveTicker from '../components/LiveTicker';
import LeagueTable from '../components/LeagueTable';
import MatchList from '../components/MatchList';
import TopScorers from '../components/TopScorers';
import GoalsChart from '../components/GoalsChart';

export default function HomePage() {
  return (
    <div className="space-y-4">
      <StatsBar />
      <LiveTicker />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left 2/3 */}
        <div className="xl:col-span-2 space-y-4">
          <MatchList mode="results" limit={6} />
          <MatchList mode="fixtures" limit={6} />
        </div>

        {/* Right 1/3 */}
        <div className="space-y-4">
          <LeagueTable compact />
          <TopScorers limit={8} compact />
        </div>
      </div>

      <GoalsChart />
    </div>
  );
}
