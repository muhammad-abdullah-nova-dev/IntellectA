import type React from "react";
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/styles/dockit.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAuthProvider } from "@/components/google-auth-provider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IntellectA — AI Study Tutor for 8 Subjects",
  description:
    "Your AI study companion with eight subject experts, adaptive quizzes, and help that follows you on every device.",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${plusJakarta.className} ${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <GoogleAuthProvider>{children}</GoogleAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
