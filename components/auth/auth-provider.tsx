"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildIXAISessionFromSupabaseSession,
  clearIdentityPayload,
  getCurrentSupabaseIXAISession,
  getGuestSession,
  isSupabaseAuthConfigured,
  readIdentityPayload,
  registerWithPassword as registerWithSupabasePassword,
  sendMagicLink,
  signInWithGoogleOAuth,
  signInWithPassword as signInWithSupabasePassword,
  signOutSupabase,
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
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";
import type {
  IXAISession,
  IntelligenceInterest,
  PersonalMemory,
  PersistenceStatus,
} from "@/src/types/identity";

type AuthActionResult = {
  ok: boolean;
  message: string;
  debugMessage?: string;
  authenticated?: boolean;
};

type IdentityContextValue = {
  mounted: boolean;
  session: IXAISession;
  memory: PersonalMemory;
  persistenceStatus: PersistenceStatus;
  authConfigured: boolean;
  signInWithGoogle: () => Promise<AuthActionResult>;
  signInWithPassword: (email: string, password: string) => Promise<AuthActionResult>;
  registerWithPassword: (email: string, password: string) => Promise<AuthActionResult>;
  sendMagicLink: (email: string) => Promise<{ ok: boolean; message: string }>;
  signOut: () => void;
  completeOnboarding: (interests: IntelligenceInterest[]) => void;
  updateMemory: (updates: Partial<PersonalMemory>) => void;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

const localPersistenceStatus: PersistenceStatus = {
  mode: "local",
  label: "本機保存",
  message: "尚未登入 IXAI Account。",
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

    async function activateAuthenticatedSession(nextSession: IXAISession) {
      const memoryResult = await loadProfileMemory(nextSession);
      const preferenceResult = await loadUserPreferences(nextSession);
      const nextMemory = {
        ...memoryResult.memory,
        preferredCategories: preferenceResult.preferences,
        onboardingCompleted: true,
      };

      if (ignore) {
        return;
      }

      setSession(nextSession);
      setMemory(nextMemory);
      setPersistenceStatus(
        memoryResult.status.mode === "synced" || preferenceResult.status.mode === "synced"
          ? {
              mode: "synced",
              label: "已連接 IXAI Account",
              message: "偏好與市場記憶已準備連接 IXAI 帳戶。",
              lastSyncedAt: new Date().toISOString(),
            }
          : memoryResult.status,
      );
      writeIdentityPayload(nextSession, nextMemory);
    }

    function clearAuthState({ redirectToLogin = false }: { redirectToLogin?: boolean } = {}) {
      clearIdentityPayload();
      setSession(getGuestSession());
      setMemory(readPersonalMemory());
      setPersistenceStatus(localPersistenceStatus);

      if (!redirectToLogin || typeof window === "undefined") {
        return;
      }

      const pathname = window.location.pathname;
      const authSafePath =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/about" ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/auth");

      if (!authSafePath) {
        window.location.assign("/login");
      }
    }

    async function hydrateIdentity() {
      const currentSession = await getCurrentSupabaseIXAISession();

      if (currentSession) {
        await activateAuthenticatedSession(currentSession);
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
    const supabase = createSupabaseBrowserClient();
    const authListener = supabase?.auth.onAuthStateChange((event, supabaseSession) => {
      const nextSession = buildIXAISessionFromSupabaseSession(supabaseSession);

      if (
        nextSession &&
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")
      ) {
        void activateAuthenticatedSession(nextSession);
        return;
      }

      if (event === "SIGNED_OUT") {
        clearAuthState({ redirectToLogin: true });
      }
    });
    const subscription = authListener?.data.subscription;

    return () => {
      ignore = true;
      subscription?.unsubscribe();
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

    async function activateAuthenticatedSession(nextSession: IXAISession) {
      const memoryResult = await loadProfileMemory(nextSession);
      const preferenceResult = await loadUserPreferences(nextSession);
      const nextMemory = {
        ...memoryResult.memory,
        preferredCategories: preferenceResult.preferences,
        onboardingCompleted: true,
      };
      persist(nextSession, nextMemory);
      setPersistenceStatus(
        memoryResult.status.mode === "synced" || preferenceResult.status.mode === "synced"
          ? {
              mode: "synced",
              label: "已連接 IXAI Account",
              message: "偏好與市場記憶已準備連接 IXAI 帳戶。",
              lastSyncedAt: new Date().toISOString(),
            }
          : memoryResult.status,
      );
    }

    return {
      mounted,
      session,
      memory,
      persistenceStatus,
      authConfigured,
      signInWithGoogle() {
        return signInWithGoogleOAuth();
      },
      sendMagicLink(email: string) {
        return sendMagicLink(email);
      },
      async signInWithPassword(email: string, password: string) {
        const result = await signInWithSupabasePassword(email, password);

        if (result.ok && result.session) {
          await activateAuthenticatedSession(result.session);
        }

        return {
          ok: result.ok,
          message: result.message,
          debugMessage: result.debugMessage,
          authenticated: Boolean(result.session),
        };
      },
      async registerWithPassword(email: string, password: string) {
        const result = await registerWithSupabasePassword(email, password);

        if (result.ok && result.session) {
          await activateAuthenticatedSession(result.session);
        }

        return {
          ok: result.ok,
          message: result.message,
          debugMessage: result.debugMessage,
          authenticated: Boolean(result.session),
        };
      },
      signOut() {
        void (async () => {
          await signOutSupabase();
          clearIdentityPayload();
          setSession(getGuestSession());
          setMemory(readPersonalMemory());
          setPersistenceStatus(localPersistenceStatus);
          window.location.assign("/login");
        })();
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
