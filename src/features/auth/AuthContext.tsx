import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../../services/supabase/client";
import { validateDisplayName, type AvatarKey, type Profile } from "./profile";

type AuthStatus = "loading" | "needs-onboarding" | "ready" | "error";

type AuthContextValue = {
  status: AuthStatus;
  profile: Profile | null;
  error: string;
  isSubmitting: boolean;
  completeOnboarding: (displayName: string, avatarKey: AvatarKey) => Promise<void>;
  retry: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LOCAL_DEMO_MODE =
  import.meta.env.DEV && import.meta.env.VITE_DEMO_PROFILE === "true";

const LOCAL_DEMO_PROFILE = {
  id: "local-demo-profile",
  display_name: "Quiet Collector",
  public_code: "LC-DEMO",
  avatar_key: "mint-unicorn",
  created_at: "2026-07-24T00:00:00.000Z",
  updated_at: "2026-07-24T00:00:00.000Z"
} satisfies Profile;

function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");

  if (message.includes("Anonymous sign-ins are disabled")) {
    return "匿名注册尚未在 Supabase 控制台开启。";
  }
  if (message.includes("DISPLAY_NAME_BLOCKED")) {
    return "这个昵称包含不适合展示的词，请换一个。";
  }
  if (message.includes("profiles_display_name")) {
    return "昵称格式不符合要求，请检查后重试。";
  }
  if (message.includes("Failed to fetch")) {
    return "暂时无法连接身份服务，请检查网络后重试。";
  }

  return "身份创建没有完成，请稍后再试。";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);

  const loadProfile = useCallback(async (session: Session | null) => {
    if (!supabase || !session) {
      setProfile(null);
      setStatus("needs-onboarding");
      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, public_code, avatar_key, created_at, updated_at")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!data) {
      setProfile(null);
      setStatus("needs-onboarding");
      return;
    }

    setProfile(data as Profile);
    setError("");
    setStatus("ready");
  }, []);

  useEffect(() => {
    let active = true;

    if (LOCAL_DEMO_MODE) {
      setProfile(LOCAL_DEMO_PROFILE);
      setError("");
      setStatus("ready");
      return () => {
        active = false;
      };
    }

    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase 环境变量尚未配置。");
      setStatus("error");
      return;
    }

    setStatus("loading");
    supabase.auth.getSession().then(async ({ data, error: sessionError }) => {
      if (!active) return;
      try {
        if (sessionError) throw sessionError;
        await loadProfile(data.session);
      } catch (authError) {
        if (!active) return;
        setError(friendlyAuthError(authError));
        setStatus("error");
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      window.setTimeout(() => {
        if (active) void loadProfile(session).catch(() => undefined);
      }, 0);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile, retryVersion]);

  const completeOnboarding = useCallback(async (displayName: string, avatarKey: AvatarKey) => {
    if (!supabase) throw new Error("Supabase is not configured");

    const validation = validateDisplayName(displayName);
    if (validation.error) throw new Error(validation.error);

    setIsSubmitting(true);
    setError("");

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      let session = sessionData.session;
      if (!session) {
        const { data: anonymousData, error: anonymousError } = await supabase.auth.signInAnonymously();
        if (anonymousError) throw anonymousError;
        session = anonymousData.session;
      }

      if (!session) throw new Error("Anonymous session was not created");

      const { data, error: onboardingError } = await supabase.rpc("complete_onboarding", {
        p_display_name: validation.value,
        p_avatar_key: avatarKey
      });
      if (onboardingError) throw onboardingError;

      setProfile(data as Profile);
      setStatus("ready");
    } catch (onboardingError) {
      const friendlyMessage = friendlyAuthError(onboardingError);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    profile,
    error,
    isSubmitting,
    completeOnboarding,
    retry: () => setRetryVersion((value) => value + 1)
  }), [completeOnboarding, error, isSubmitting, profile, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
