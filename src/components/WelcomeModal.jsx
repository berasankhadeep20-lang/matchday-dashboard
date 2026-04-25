import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function WelcomeModal() {
  const { setUsername, setApiKey } = useApp();
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // API key is stored in the Cloudflare Worker as a secret — not needed here
    // We set a placeholder so AppContext knows auth is configured
    setUsername(name.trim() || 'Guest');
    setApiKey('via-worker');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto py-8">
      <div className="absolute inset-0 bg-pitch/95 backdrop-blur-sm" />

      {/* Stadium decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-neon/5 -translate-y-1/2" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-neon/5 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-neon/8" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-neon/20" />
      </div>

      <div className="relative w-full max-w-md mx-4 animate-slide-up">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-neon to-transparent rounded-t-xl" />

        <div className="md-card p-8 neon-glow rounded-t-none">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-neon live-dot" />
              <span className="text-neon font-mono text-xs tracking-widest uppercase">Live Data</span>
            </div>
            <div className="font-display font-black text-5xl tracking-tight leading-none mb-1">
              <span className="text-neon">MATCH</span>
              <span className="text-text-bright">DAY</span>
            </div>
            <p className="text-pitch-muted font-display text-sm tracking-widest uppercase">
              Football Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-pitch-border" />
            <div className="w-1.5 h-1.5 rounded-full bg-neon/40" />
            <div className="flex-1 h-px bg-pitch-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-pitch-muted font-mono text-xs uppercase tracking-widest mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ronnie"
                maxLength={30}
                autoFocus
                className="w-full bg-pitch-dark border border-pitch-border rounded-lg px-4 py-2.5 text-text-bright placeholder-pitch-muted/40 font-body focus:outline-none focus:border-neon transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-neon hover:bg-neon-dim text-pitch font-display font-bold uppercase tracking-widest py-3 rounded-lg transition-all hover:scale-[1.01] active:scale-95 text-base mt-2"
            >
              Enter Matchday ⚽
            </button>
          </form>

          <div className="mt-5 p-3 rounded-lg bg-pitch-card-alt border border-pitch-border">
            <p className="text-pitch-muted font-mono text-xs text-center">
              🔐 Data via{' '}
              <span className="text-neon">football-data.org</span>
              {' '}· API key secured in Cloudflare Worker
            </p>
          </div>
        </div>

        <div className="h-0.5 bg-gradient-to-r from-transparent via-neon/30 to-transparent rounded-b-xl" />
      </div>
    </div>
  );
}
