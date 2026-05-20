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
  writePersonalMemory,
} from "@/src/lib/personalization/memory";
import type {
  IXAISession,
  IntelligenceInterest,
  PersonalMemory,
} from "@/src/types/identity";

type IdentityContextValue = {
  mounted: boolean;
  session: IXAISession;
  memory: PersonalMemory;
  authConfigured: boolean;
  signInWithGoogle: () => void;
  sendMagicLink: (email: string) => Promise<{ ok: boolean; message: string }>;
  continueAsGuest: () => void;
  signOut: () => void;
  completeOnboarding: (interests: IntelligenceInterest[]) => void;
  updateMemory: (updates: Partial<PersonalMemory>) => void;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<IXAISession>(getGuestSession);
  const [memory, setMemory] = useState<PersonalMemory>(createDefaultMemory);
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
          const nextMemory = readPersonalMemory(user.id);
          setSession(nextSession);
          setMemory(nextMemory);
          writeIdentityPayload(nextSession, nextMemory);
          window.history.replaceState(null, document.title, window.location.pathname);
        }
      } else {
        const payload = readIdentityPayload();
        if (!ignore) {
          setSession(payload.session);
          setMemory(payload.memory);
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

    writePersonalMemory(nextMemory, session.user?.id);
  }, [memory, mounted, session.user?.id]);

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
      },
      completeOnboarding(interests: IntelligenceInterest[]) {
        const nextMemory = {
          ...memory,
          preferredCategories: interests,
          onboardingCompleted: true,
          lastVisitAt: new Date().toISOString(),
        };
        persist(session, nextMemory);
      },
      updateMemory(updates: Partial<PersonalMemory>) {
        const nextMemory = {
          ...memory,
          ...updates,
          lastVisitAt: new Date().toISOString(),
        };
        persist(session, nextMemory);
      },
    };
  }, [authConfigured, memory, mounted, session]);

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
