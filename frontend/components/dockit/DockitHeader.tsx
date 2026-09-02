"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IntellectAWordmark } from "@/components/brand/intellecta-logo";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { isAuthenticated } from "@/lib/auth";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#subjects", label: "Subjects" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
];

export function DockitHeader() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  return (
    <header className="dockit-header">
      <div className="dockit-container flex items-center justify-between gap-4">
        <IntellectAWordmark href="/" width={128} className="h-8" />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loggedIn ? (
            <Link href="/chat" className="btn-primary btn-sm">
              Open workspace
            </Link>
          ) : (
            <>
              <GoogleSignInButton />
              <Link href="/login" className="btn-primary btn-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="dockit-container border-t border-white/10 py-4 md:hidden">
          {NAV.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="nav-link block"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            {loggedIn ? (
              <Link href="/chat" className="btn-primary btn-sm text-center">
                Open workspace
              </Link>
            ) : (
              <>
                <GoogleSignInButton className="w-full text-center" />
                <Link href="/login" className="btn-primary btn-sm text-center">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
