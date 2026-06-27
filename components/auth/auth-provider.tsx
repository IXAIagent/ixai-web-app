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
import { bootstrapUserProfile } from "@/src/lib/account/profile";
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

function warnAuthProvider(context: string, error: unknown) {
  console.warn("[IXAI AUTH PROVIDER] runtime fallback", {
    context,
    message: error instanceof Error ? error.message : "unknown_error",
  });
}

function pendingAuthStatus(message: string): PersistenceStatus {
  return {
    mode: "pending",
    label: "Sync pending",
    message,
  };
}

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
      try {
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
        void bootstrapUserProfile(nextSession).catch((error) => {
          warnAuthProvider("bootstrapUserProfile", error);
        });
      } catch (error) {
        warnAuthProvider("activateAuthenticatedSession", error);
        if (!ignore) {
          setSession(nextSession);
          setMemory(readPersonalMemory(nextSession.user?.id));
          setPersistenceStatus(
            pendingAuthStatus("Session restored. Profile sync fell back to local memory."),
          );
        }
      }
    }

    function clearAuthState({ redirectToLogin = false }: { redirectToLogin?: boolean } = {}) {
      try {
        clearIdentityPayload();
      } catch (error) {
        warnAuthProvider("clearIdentityPayload", error);
      }
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
        pathname === "/feedback" ||
        pathname === "/app-preview" ||
        pathname.startsWith("/daily-brief") ||
        pathname.startsWith("/share") ||
        pathname.startsWith("/weekly-brief") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/auth");

      if (!authSafePath) {
        window.location.assign("/login");
      }
    }

    async function hydrateIdentity() {
      try {
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
                ? pendingAuthStatus(
                    "Session restored locally. Supabase hydration will resume when available.",
                  )
                : localPersistenceStatus,
            );
          }
        }
      } catch (error) {
        warnAuthProvider("hydrateIdentity", error);
        if (!ignore) {
          setSession(getGuestSession());
          setMemory(readPersonalMemory());
          setPersistenceStatus(localPersistenceStatus);
        }
      } finally {
        if (!ignore) {
          setMounted(true);
        }
      }
    }

    void hydrateIdentity().catch((error) => {
      warnAuthProvider("hydrateIdentity.unhandled", error);
      if (!ignore) {
        setMounted(true);
      }
    });
    const supabase = createSupabaseBrowserClient();
    const authListener = supabase?.auth.onAuthStateChange((event, supabaseSession) => {
      try {
        const nextSession = buildIXAISessionFromSupabaseSession(supabaseSession);

        if (
          nextSession &&
          (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")
        ) {
          void activateAuthenticatedSession(nextSession).catch((error) => {
            warnAuthProvider(`authStateChange.${event}`, error);
          });
          return;
        }

        if (event === "SIGNED_OUT") {
          clearAuthState({ redirectToLogin: true });
        }
      } catch (error) {
        warnAuthProvider(`authStateChange.${event}`, error);
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

    void saveProfileMemory(session, nextMemory)
      .then((status) => {
        setPersistenceStatus(status);
      })
      .catch((error) => {
        warnAuthProvider("saveProfileMemory.visit", error);
        setPersistenceStatus(
          pendingAuthStatus("Profile memory sync failed safely; local memory remains available."),
        );
      });
  }, [memory, mounted, session]);

  const value = useMemo<IdentityContextValue>(() => {
    function persist(nextSession: IXAISession, nextMemory: PersonalMemory) {
      setSession(nextSession);
      setMemory(nextMemory);
      try {
        writeIdentityPayload(nextSession, nextMemory);
      } catch (error) {
        warnAuthProvider("writeIdentityPayload", error);
        setPersistenceStatus(
          pendingAuthStatus("Identity payload could not be stored locally; session remains active."),
        );
      }
    }

    async function activateAuthenticatedSession(nextSession: IXAISession) {
      try {
        const memoryResult = await loadProfileMemory(nextSession);
        const preferenceResult = await loadUserPreferences(nextSession);
        const nextMemory = {
          ...memoryResult.memory,
          preferredCategories: preferenceResult.preferences,
          onboardingCompleted: true,
        };
        persist(nextSession, nextMemory);
        void bootstrapUserProfile(nextSession).catch((error) => {
          warnAuthProvider("bootstrapUserProfile.action", error);
        });
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
      } catch (error) {
        warnAuthProvider("activateAuthenticatedSession.action", error);
        persist(nextSession, readPersonalMemory(nextSession.user?.id));
        setPersistenceStatus(
          pendingAuthStatus("Account session is active; profile sync fell back safely."),
        );
      }
    }

    return {
      mounted,
      session,
      memory,
      persistenceStatus,
      authConfigured,
      signInWithGoogle() {
        return signInWithGoogleOAuth().catch((error) => {
          warnAuthProvider("signInWithGoogle", error);
          return {
            ok: false,
            message: "目前無法前往 Google 登入。",
          };
        });
      },
      sendMagicLink(email: string) {
        return sendMagicLink(email).catch((error) => {
          warnAuthProvider("sendMagicLink", error);
          return {
            ok: false,
            message: "登入連結暫時無法送出，請稍後再試。",
          };
        });
      },
      async signInWithPassword(email: string, password: string) {
        try {
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
        } catch (error) {
          warnAuthProvider("signInWithPassword", error);
          return {
            ok: false,
            message: "目前無法登入 IXAI。",
            authenticated: false,
          };
        }
      },
      async registerWithPassword(email: string, password: string) {
        try {
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
        } catch (error) {
          warnAuthProvider("registerWithPassword", error);
          return {
            ok: false,
            message: "IXAI Account 暫時無法建立。",
            authenticated: false,
          };
        }
      },
      signOut() {
        void (async () => {
          try {
            await signOutSupabase();
          } catch (error) {
            warnAuthProvider("signOutSupabase", error);
          } finally {
            try {
              clearIdentityPayload();
            } catch (error) {
              warnAuthProvider("clearIdentityPayload.signOut", error);
            }
            setSession(getGuestSession());
            setMemory(readPersonalMemory());
            setPersistenceStatus(localPersistenceStatus);
            window.location.assign("/login");
          }
        })().catch((error) => {
          warnAuthProvider("signOut", error);
        });
      },
      completeOnboarding(interests: IntelligenceInterest[]) {
        const nextMemory = {
          ...memory,
          preferredCategories: interests,
          onboardingCompleted: true,
          lastVisitAt: new Date().toISOString(),
        };
        persist(session, nextMemory);
        void saveUserPreferences(session, interests)
          .then((status) => {
            setPersistenceStatus(status);
          })
          .catch((error) => {
            warnAuthProvider("saveUserPreferences.completeOnboarding", error);
            setPersistenceStatus(
              pendingAuthStatus("Preference sync failed safely; local preferences remain available."),
            );
          });
        void saveProfileMemory(session, nextMemory)
          .then((status) => {
            setPersistenceStatus(status);
          })
          .catch((error) => {
            warnAuthProvider("saveProfileMemory.completeOnboarding", error);
            setPersistenceStatus(
              pendingAuthStatus("Profile memory sync failed safely; local memory remains available."),
            );
          });
      },
      updateMemory(updates: Partial<PersonalMemory>) {
        const nextMemory = {
          ...memory,
          ...updates,
          lastVisitAt: new Date().toISOString(),
        };
        persist(session, nextMemory);
        void saveProfileMemory(session, nextMemory)
          .then((status) => {
            setPersistenceStatus(status);
          })
          .catch((error) => {
            warnAuthProvider("saveProfileMemory.updateMemory", error);
            setPersistenceStatus(
              pendingAuthStatus("Profile memory sync failed safely; local memory remains available."),
            );
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
