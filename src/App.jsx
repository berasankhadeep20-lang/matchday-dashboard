import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import WelcomeModal from './components/WelcomeModal';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LeaguePage from './pages/LeaguePage';
import FixturesPage from './pages/FixturesPage';
import TeamsPage from './pages/TeamsPage';
import PlayersPage from './pages/PlayersPage';

function AppInner() {
  const { username, apiKey, activeTab } = useApp();

  if (!username) return <WelcomeModal />;

  const pages = {
    home:     <HomePage />,
    league:   <LeaguePage />,
    fixtures: <FixturesPage />,
    teams:    <TeamsPage />,
    players:  <PlayersPage />,
  };

  return (
    <div className="min-h-screen bg-pitch">
      <Navbar />

      {/* Welcome strip */}
      <div className="border-b border-pitch-border bg-pitch-card/50">
        <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center gap-3">
          <span className="text-neon text-xs">⚽</span>
          <span className="text-text-bright font-body font-semibold text-sm">
            Welcome back, <span className="text-neon">{username}</span>
          </span>
          <span className="text-pitch-muted font-mono text-xs ml-auto hidden sm:block">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {pages[activeTab] ?? <HomePage />}
      </main>

      <footer className="border-t border-pitch-border mt-12 py-6 text-center">
        <p className="text-pitch-muted font-mono text-xs">
          Data via{' '}
          <a href="https://www.football-data.org" target="_blank" rel="noreferrer" className="text-neon hover:underline">
            football-data.org
          </a>
          {' · MATCHDAY Dashboard · Not affiliated with any football organisation'}
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>;
}
