import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Researcher, ResearchProject } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import {
  createResearcherProfile,
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

const STUB_USER: Researcher = {
  id: "",
  name: "",
  nameEn: "",
  email: "",
  avatar: "",
  degree: "",
  degreeEn: "",
  university: "",
  universityEn: "",
  faculty: "",
  facultyEn: "",
  field: "",
  fieldEn: "",
  subField: "",
  subFieldEn: "",
  interests: [],
  interestsEn: [],
};

const userFromAuthMeta = (
  authId: string,
  email: string,
  meta: Record<string, unknown>,
): Researcher => {
  const s = (k: string, fallback = ""): string => {
    const v = meta[k];
    return typeof v === "string" ? v : fallback;
  };
  const arr = (k: string): string[] => {
    const v = meta[k];
    return Array.isArray(v) ? (v as string[]) : [];
  };
  return {
    id: authId,
    name: s("name"),
    nameEn: s("name_en", s("name")),
    email,
    avatar: s("avatar"),
    degree: s("degree"),
    degreeEn: s("degree_en", s("degree")),
    university: s("university"),
    universityEn: s("university_en", s("university")),
    faculty: s("faculty"),
    facultyEn: s("faculty_en", s("faculty")),
    field: s("field"),
    fieldEn: s("field_en", s("field")),
    subField: s("sub_field"),
    subFieldEn: s("sub_field_en", s("sub_field")),
    interests: arr("interests"),
    interestsEn: arr("interests_en").length > 0 ? arr("interests_en") : arr("interests"),
    orcid: s("orcid") || undefined,
    scholar: s("scholar") || undefined,
    scopus: s("scopus") || undefined,
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Researcher | null>(null);
  const [allResearchers, setAllResearchers] = useState<Researcher[]>([]);
  const [allProjects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = !!authUser;

  // user is ALWAYS keyed by the real auth.uid — DB profile if available,
  // otherwise synthesized from auth.user_metadata. Never falls back to mocks.
  const user: Researcher = useMemo(() => {
    if (profile) return profile;
    if (authUser) {
      return userFromAuthMeta(
        authUser.id,
        authUser.email ?? "",
        (authUser.user_metadata ?? {}) as Record<string, unknown>,
      );
    }
    return STUB_USER;
  }, [profile, authUser]);

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
      setProfile(null);
      setAllResearchers([]);
      setProjects([]);
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
        if (me) {
          setProfile(me);
        } else {
          // No researcher row exists yet — the handle_new_user trigger may
          // not have run (e.g. signup happened before the trigger was added).
          // Create the row from auth metadata so create-project + RLS work.
          const seed = userFromAuthMeta(
            authUser.id,
            authUser.email ?? "",
            (authUser.user_metadata ?? {}) as Record<string, unknown>,
          );
          try {
            await createResearcherProfile({
              id: seed.id,
              name: seed.name,
              nameEn: seed.nameEn,
              email: seed.email,
              degree: seed.degree,
              degreeEn: seed.degreeEn,
              university: seed.university,
              universityEn: seed.universityEn,
              faculty: seed.faculty,
              facultyEn: seed.facultyEn,
              field: seed.field,
              fieldEn: seed.fieldEn,
              subField: seed.subField,
              subFieldEn: seed.subFieldEn,
              interests: seed.interests,
              interestsEn: seed.interestsEn,
              orcid: seed.orcid,
              scholar: seed.scholar,
              scopus: seed.scopus,
            });
            const created = await fetchMyResearcher(authUser.id);
            if (!cancelled && created) setProfile(created);
          } catch (e) {
            console.error("[AppContext] auto-create researcher failed", e);
          }
        }
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

  // Kept for backwards-compat — actual login state is derived from session.
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
