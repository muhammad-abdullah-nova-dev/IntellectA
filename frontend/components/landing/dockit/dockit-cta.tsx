"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntellectALogoMark } from "@/components/brand/logo";

export function DockitCta() {
  return (
    <section id="get-started" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/20 via-card to-indigo-600/10 p-10 text-center sm:p-14"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_90%_68%_/_0.12),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to explore IntellectA?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Join focused learners using multi-agent AI for exam prep, homework,
              and daily revision.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl brand-gradient border-0 px-8 text-white"
              >
                <Link href="/login">
                  <IntellectALogoMark className="mr-2 h-5 w-5" />
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-border/80 px-8"
              >
                <Link href="/chat">Open workspace</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
