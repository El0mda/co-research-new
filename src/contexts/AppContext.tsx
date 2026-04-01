import React, { createContext, useContext } from "react";
import { useAuth, CurrentUser } from "@/contexts/AuthContext";

interface AppContextType {
  user: CurrentUser | null;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <AppContext.Provider value={{
      user,
      isLoggedIn,
      setIsLoggedIn: (v: boolean) => { if (!v) logout(); },
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
