import React, { createContext, useContext, useEffect, useState } from "react";
import {
  researchers as mockResearchers,
  projects as mockProjects,
  currentUser as mockUser,
  type Researcher,
  type ResearchProject,
} from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchMyResearcher,
  fetchProjects,
  fetchResearchers,
} from "@/lib/queries";

interface AppContextType {
  user: Researcher;
  allResearchers: Researcher[];
  allProjects: ResearchProject[];
  setProjects: React.Dispatch<React.SetStateAction<ResearchProject[]>>;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  refreshProjects: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<Researcher>(mockUser);
  const [allResearchers, setAllResearchers] =
    useState<Researcher[]>(mockResearchers);
  const [allProjects, setProjects] =
    useState<ResearchProject[]>(mockProjects);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = !!authUser;

  const refreshProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error("[AppContext] fetchProjects failed", err);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      setUser(mockUser);
      setAllResearchers(mockResearchers);
      setProjects(mockProjects);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [me, rs, ps] = await Promise.all([
          fetchMyResearcher(authUser.id),
          fetchResearchers(),
          fetchProjects(),
        ]);
        if (cancelled) return;
        if (me) setUser(me);
        setAllResearchers(rs);
        setProjects(ps);
      } catch (err) {
        console.error("[AppContext] failed to load user data", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authUser, authLoading]);

  // Kept for backwards-compat with pages that still call setIsLoggedIn —
  // actual login state is derived from the auth session.
  const setIsLoggedIn = () => {};

  return (
    <AppContext.Provider
      value={{
        user,
        allResearchers,
        allProjects,
        setProjects,
        isLoggedIn,
        setIsLoggedIn,
        refreshProjects,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
