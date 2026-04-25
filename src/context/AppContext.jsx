import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const TABS = [
  { id: 'home',     label: 'Home' },
  { id: 'league',   label: 'League' },
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'teams',    label: 'Teams' },
  { id: 'players',  label: 'Players' },
];

export function AppProvider({ children }) {
  const [username, setUsername]     = useState(() => localStorage.getItem('md_username') || '');
  const [apiKey, setApiKey]         = useState(() => localStorage.getItem('md_apikey') || '');
  const [competition, setCompetition] = useState(() => localStorage.getItem('md_comp') || 'PL');
  const [season, setSeason]         = useState(() => localStorage.getItem('md_season') || 'current');
  const [activeTab, setActiveTab]   = useState('home');
  const [favoriteTeam, setFavoriteTeam] = useState(() => localStorage.getItem('md_fav') || null);

  useEffect(() => { if (username) localStorage.setItem('md_username', username); }, [username]);
  useEffect(() => { if (apiKey)   localStorage.setItem('md_apikey', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('md_comp', competition); }, [competition]);
  useEffect(() => { if (favoriteTeam) localStorage.setItem('md_fav', favoriteTeam); }, [favoriteTeam]);

  const logout = () => {
    localStorage.removeItem('md_username');
    localStorage.removeItem('md_apikey');
    setUsername('');
    setApiKey('');
  };

  return (
    <AppContext.Provider value={{
      username, setUsername,
      apiKey, setApiKey,
      competition, setCompetition,
      season, setSeason,
      activeTab, setActiveTab,
      favoriteTeam, setFavoriteTeam,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
