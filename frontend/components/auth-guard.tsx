"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoIcon } from "@/components/brand/logo";
import { getStoredToken } from "@/lib/auth";
import { authApi } from "@/utils/auth-api";
import { saveAuth } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    authApi
      .me()
      .then((data) => {
        if (data.user && token) {
          saveAuth(token, data.user);
        }
        setReady(true);
      })
      .catch(() => {
        authApi.logout();
        router.replace("/login");
      });
  }, [router]);

  if (!ready) {
    return (
      <div className="dockit-page flex h-screen flex-col items-center justify-center gap-4">
        <LogoIcon size="lg" className="animate-pulse" />
        <p className="text-sm text-[#999]">Verifying your session…</p>
      </div>
    );
  }

  return <>{children}</>;
}
