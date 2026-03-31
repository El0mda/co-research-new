import React, { createContext, useContext, useState } from 'react';
import { researchers, projects, currentUser, type Researcher, type ResearchProject } from '@/data/mockData';

interface AppContextType {
  user: Researcher;
  allResearchers: Researcher[];
  allProjects: ResearchProject[];
  setProjects: React.Dispatch<React.SetStateAction<ResearchProject[]>>;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allProjects, setProjects] = useState(projects);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AppContext.Provider value={{
      user: currentUser,
      allResearchers: researchers,
      allProjects,
      setProjects,
      isLoggedIn,
      setIsLoggedIn,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
