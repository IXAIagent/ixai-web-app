"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildGoogleOAuthUrl,
  clearIdentityPayload,
  fetchSupabaseUser,
  getGuestSession,
  isSupabaseAuthConfigured,
  readHashSession,
  readIdentityPayload,
  sendMagicLink,
  writeIdentityPayload,
} from "@/src/lib/identity/session";
import {
  createDefaultMemory,
  readPersonalMemory,
} from "@/src/lib/personalization/memory";
import {
  loadProfileMemory,
  loadUserPreferences,
  saveProfileMemory,
  saveUserPreferences,
} from "@/src/lib/personalization/persistence";
import type {
  IXAISession,
  IntelligenceInterest,
  PersonalMemory,
  PersistenceStatus,
} from "@/src/types/identity";

type IdentityContextValue = {
  mounted: boolean;
  session: IXAISession;
  memory: PersonalMemory;
  persistenceStatus: PersistenceStatus;
  authConfigured: boolean;
  signInWithGoogle: () => void;
  sendMagicLink: (email: string) => Promise<{ ok: boolean; message: string }>;
  continueAsGuest: () => void;
  signOut: () => void;
  completeOnboarding: (interests: IntelligenceInterest[]) => void;
  updateMemory: (updates: Partial<PersonalMemory>) => void;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

const localPersistenceStatus: PersistenceStatus = {
  mode: "local",
  label: "Local only",
  message: "Guest data is stored on this device.",
};

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<IXAISession>(getGuestSession);
  const [memory, setMemory] = useState<PersonalMemory>(createDefaultMemory);
  const [persistenceStatus, setPersistenceStatus] =
    useState<PersistenceStatus>(localPersistenceStatus);
  const authConfigured = isSupabaseAuthConfigured();

  useEffect(() => {
    let ignore = false;

    async function hydrateIdentity() {
      const hashSession = readHashSession();

      if (hashSession) {
        const user = await fetchSupabaseUser(hashSession.accessToken);

        if (user && !ignore) {
          const nextSession: IXAISession = {
            mode: "authenticated",
            user,
            accessToken: hashSession.accessToken,
            refreshToken: hashSession.refreshToken,
            expiresAt: hashSession.expiresAt,
          };
          const memoryResult = await loadProfileMemory(nextSession);
          const preferenceResult = await loadUserPreferences(nextSession);
          const nextMemory = {
            ...memoryResult.memory,
            preferredCategories: preferenceResult.preferences,
          };
          setSession(nextSession);
          setMemory(nextMemory);
          setPersistenceStatus(
            memoryResult.status.mode === "synced" || preferenceResult.status.mode === "synced"
              ? {
                  mode: "synced",
                  label: "Synced",
                  message: "Profile memory and preferences are connected to your IXAI account.",
                  lastSyncedAt: new Date().toISOString(),
                }
              : memoryResult.status,
          );
          writeIdentityPayload(nextSession, nextMemory);
          window.history.replaceState(null, document.title, window.location.pathname);
        }
      } else {
        const payload = readIdentityPayload();
        if (!ignore) {
          setSession(payload.session);
          setMemory(payload.memory);
          setPersistenceStatus(
            payload.session.mode === "authenticated"
              ? {
                  mode: "pending",
                  label: "Sync pending",
                  message: "Session restored locally. Supabase hydration will resume when available.",
                }
              : localPersistenceStatus,
          );
        }
      }

      if (!ignore) {
        setMounted(true);
      }
    }

    void hydrateIdentity();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const nextMemory = {
      ...memory,
      lastVisitAt: new Date().toISOString(),
    };

    void saveProfileMemory(session, nextMemory).then((status) => {
      setPersistenceStatus(status);
    });
  }, [memory, mounted, session]);

  const value = useMemo<IdentityContextValue>(() => {
    function persist(nextSession: IXAISession, nextMemory: PersonalMemory) {
      setSession(nextSession);
      setMemory(nextMemory);
      writeIdentityPayload(nextSession, nextMemory);
    }

    return {
      mounted,
      session,
      memory,
      persistenceStatus,
      authConfigured,
      signInWithGoogle() {
        const url = buildGoogleOAuthUrl(window.location.origin + "/account");
        if (url) {
          window.location.href = url;
        }
      },
      sendMagicLink(email: string) {
        return sendMagicLink(email, window.location.origin + "/account");
      },
      continueAsGuest() {
        const nextMemory = {
          ...memory,
          onboardingCompleted: true,
        };
        persist(getGuestSession(), nextMemory);
      },
      signOut() {
        clearIdentityPayload();
        setSession(getGuestSession());
        setMemory(readPersonalMemory());
        setPersistenceStatus(localPersistenceStatus);
      },
      completeOnboarding(interests: IntelligenceInterest[]) {
        const nextMemory = {
          ...memory,
          preferredCategories: interests,
          onboardingCompleted: true,
          lastVisitAt: new Date().toISOString(),
        };
        persist(session, nextMemory);
        void saveUserPreferences(session, interests).then((status) => {
          setPersistenceStatus(status);
        });
        void saveProfileMemory(session, nextMemory).then((status) => {
          setPersistenceStatus(status);
        });
      },
      updateMemory(updates: Partial<PersonalMemory>) {
        const nextMemory = {
          ...memory,
          ...updates,
          lastVisitAt: new Date().toISOString(),
        };
        persist(session, nextMemory);
        void saveProfileMemory(session, nextMemory).then((status) => {
          setPersistenceStatus(status);
        });
      },
    };
  }, [authConfigured, memory, mounted, persistenceStatus, session]);

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const value = useContext(IdentityContext);

  if (!value) {
    throw new Error("useIdentity must be used within AuthProvider");
  }

  return value;
}
