"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { authApi } from "@/utils/auth-api";
import { cn } from "@/lib/utils";

const GOOGLE_ENABLED = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export function GoogleSignInButton({
  className,
  label = "Sign in",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    setLoading(true);
    try {
      await authApi.loginWithGoogle(response.credential);
      router.push("/chat");
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (!GOOGLE_ENABLED) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className={cn("btn-outline-primary text-sm", className)}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "google-signin-trigger relative inline-flex items-center justify-center",
        className
      )}
    >
      <span className="btn-outline-primary pointer-events-none relative z-0 w-full text-center text-sm">
        {loading ? "Signing in…" : label}
      </span>
      <div className="google-signin-overlay" aria-label={label}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => router.push("/login")}
          theme="filled_black"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>
    </div>
  );
}
