import React from 'react';
import LeagueTable from '../components/LeagueTable';
import PointsChart from '../components/PointsChart';
import GoalsChart from '../components/GoalsChart';
import TopScorers from '../components/TopScorers';

export default function LeaguePage() {
  return (
    <div className="space-y-4">
      <LeagueTable />
      <PointsChart />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GoalsChart />
        <TopScorers limit={15} />
      </div>
    </div>
  );
}
