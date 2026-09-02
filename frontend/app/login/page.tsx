"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IntellectAWordmark } from "@/components/brand/intellecta-logo";
import { useRouter } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { authApi } from "@/utils/auth-api";
import { isAuthenticated } from "@/lib/auth";
import { SUBJECTS } from "@/lib/subjects";
import { SubjectIcon } from "@/components/subject-icon";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";

const GOOGLE_ENABLED = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

const PERKS = [
  "8 subject experts",
  "Chat history on every device",
  "Adaptive quizzes & clear formulas",
  "Image upload for diagram doubts",
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) router.replace("/chat");
  }, [router]);

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError("Google sign-in failed");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authApi.loginWithGoogle(response.credential);
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") await authApi.register(email, password, name);
      else await authApi.login(email, password);
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dockit-page relative flex min-h-screen flex-col">
      <div className="hero-bg-wrap" aria-hidden />

      <header className="dockit-header relative z-10">
        <div className="dockit-container flex items-center justify-between">
          <IntellectAWordmark href="/" width={128} className="h-8" />
          <Link href="/" className="nav-link text-sm">
            ← Back to home
          </Link>
        </div>
      </header>

      <div className="dockit-login-layout">
        {/* Left — marketing */}
        <div className="dockit-login-left">
          <div className="max-w-lg space-y-6">
            <div>
              <p className="dockit-login-kicker">AI Study Tutor</p>
              <div className="dockit-login-badge">
                <Sparkles className="h-3.5 w-3.5" />
                Personalized for every subject
              </div>
              <h1 className="dockit-login-title">
                Your personal{" "}
                <span className="gradient-text">study team</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[#999]">
                Eight subject experts, one workspace. Sign in to unlock
                cross-device memory and permanent chat history.
              </p>
            </div>

            <ul className="space-y-3">
              {PERKS.map((perk, i) => (
                <motion.li
                  key={perk}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="dockit-login-perk"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{perk}</span>
                </motion.li>
              ))}
            </ul>

            <div className="grid grid-cols-4 gap-2">
              {SUBJECTS.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  title={s.name}
                  className="dockit-subject-tile"
                >
                  <SubjectIcon subject={s} size="sm" />
                  <span>{s.name.split(" ")[0]}</span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* Right — auth */}
        <div className="dockit-login-right">
          <div className="dockit-auth-card dockit-auth-card--visible">
            <div className="mb-6 lg:hidden">
              <IntellectAWordmark width={110} className="h-7" />
            </div>

            <div className="flex items-center gap-2 text-sm text-[#999]">
              <Lock className="h-4 w-4" />
              Secure sign-in
            </div>
            <h2>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-[#999]">
              {mode === "login"
                ? "Continue where you left off — on any device"
                : "Join focused learners using IntellectA"}
            </p>

            {GOOGLE_ENABLED && (
              <div className="mt-6">
                <div className="flex justify-center overflow-hidden rounded-xl [&>div]:w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google sign-in cancelled")}
                    theme="filled_black"
                    size="large"
                    text={mode === "login" ? "signin_with" : "signup_with"}
                    shape="rectangular"
                    width="360"
                  />
                </div>
                <div className="dockit-auth-divider">
                  <span>or</span>
                </div>
              </div>
            )}

            <div className={`dockit-auth-tabs ${GOOGLE_ENABLED ? "" : "mt-6"}`}>
              {(["login", "register"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMode(tab)}
                  className={`dockit-auth-tab ${mode === tab ? "active" : ""}`}
                >
                  {tab === "login" ? "Sign in" : "Register"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {mode === "register" && (
                <div>
                  <label htmlFor="name" className="dockit-auth-label">
                    Full name
                  </label>
                  <input
                    id="name"
                    className="dockit-auth-input"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="dockit-auth-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="dockit-auth-input"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="password" className="dockit-auth-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="dockit-auth-input"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              {error && <p className="dockit-auth-error">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary btn-block"
              >
                {loading ? (
                  "Please wait…"
                ) : mode === "login" ? (
                  <>
                    Sign in to workspace
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <p className="mt-8 text-center">
              <Link href="/" className="dockit-auth-back">
                ← Explore IntellectA
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
