import React, { useState } from 'react';
import { useApp, TABS } from '../context/AppContext';
import { COMPETITIONS } from '../utils/api';

export default function Navbar() {
  const { username, competition, setCompetition, activeTab, setActiveTab, logout } = useApp();
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-pitch-border bg-pitch/95 backdrop-blur-md">
      {/* Neon top stripe */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-neon/60 to-transparent" />

      <div className="max-w-screen-xl mx-auto px-4">
        {/* Main row */}
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => setActiveTab('home')} className="font-display font-black text-xl tracking-tight hover:opacity-80 transition-opacity">
              <span className="text-neon">MATCH</span>
              <span className="text-text-bright">DAY</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 bg-neon/8 border border-neon/20 rounded px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon live-dot" />
              <span className="text-neon font-mono text-[10px] uppercase tracking-widest">Live</span>
            </div>
          </div>

          {/* Page tabs — desktop */}
          <nav className="hidden md:flex items-center gap-0.5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded font-display font-semibold text-sm uppercase tracking-wide transition-all ${
                  activeTab === tab.id
                    ? 'bg-neon text-pitch'
                    : 'text-pitch-muted hover:text-text-bright hover:bg-pitch-card'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:block text-pitch-muted font-mono text-xs">
              {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-neon/20 border border-neon/30 flex items-center justify-center text-neon font-display font-bold text-xs">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="text-text-bright text-sm font-body">{username}</span>
            </div>
            <button
              onClick={logout}
              className="text-pitch-muted hover:text-loss text-xs font-mono transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Competition tabs */}
        <div className="flex gap-1 pb-2 overflow-x-auto no-scrollbar">
          {Object.entries(COMPETITIONS).map(([code, info]) => (
            <button
              key={code}
              onClick={() => setCompetition(code)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded text-xs font-display font-semibold uppercase tracking-wide transition-all ${
                competition === code
                  ? 'bg-pitch-card border border-neon/40 text-neon'
                  : 'text-pitch-muted hover:text-text-bright'
              }`}
            >
              <span>{info.flag}</span>
              <span>{info.abbr}</span>
            </button>
          ))}
        </div>

        {/* Mobile page tabs */}
        <div className="flex md:hidden gap-1 pb-2 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-3 py-1 rounded text-xs font-display font-semibold uppercase tracking-wide transition-all ${
                activeTab === tab.id ? 'bg-neon text-pitch' : 'text-pitch-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
