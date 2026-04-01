import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CurrentUser {
  id: number;
  full_name: string;
  display_name: string;
  email: string;
  profile_photo: string | null;
  field: string;
  sub_field: string;
  degree: string;
  university: string;
  faculty: string;
  interests: string[];
  orcid?: string;
  scholar?: string;
  scopus?: string;
  lang_pref: "ar" | "en";
  is_approved: boolean;
}

interface AuthContextType {
  token: string | null;
  user: CurrentUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, user: CurrentUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const TOKEN_KEY = "co_research_token";
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    if (token) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  const login = useCallback((newToken: string, newUser: CurrentUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) { setIsLoading(false); return; }
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (!res.ok) { logout(); return; }
      const data = await res.json();
      setUser(data);
      setToken(storedToken);
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn: !!user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
