"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Activity, BookOpen, Zap } from "lucide-react";
import { IntellectALogoMark } from "@/components/brand/logo";
import { TypingIndicator } from "./typing-indicator";

export function HeroDashboard({
  variant = "default",
}: {
  variant?: "default" | "embedded";
}) {
  const [showReply, setShowReply] = useState(false);
  const embedded = variant === "embedded";

  useEffect(() => {
    const t = setTimeout(() => setShowReply(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`hero-dash relative z-10 mx-auto w-full ${embedded ? "hero-dash--embedded max-w-full" : "max-w-lg lg:max-w-none"}`}
    >
      {!embedded && (
        <>
          <div className="hero-dash-glow hero-dash-glow--coral" />
          <div className="hero-dash-glow hero-dash-glow--purple" />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="hero-dash-window"
      >
        <motion.div
          className="hero-dash-window-shine"
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="hero-dash-titlebar">
          <div className="hero-dash-traffic">
            <span />
            <span />
            <span />
          </div>
          <span className="hero-dash-url">intellecta.app/chat</span>
        </div>

        <div className="hero-dash-body">
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="intellecta-user-bubble hero-dash-user-bubble"
          >
            In special relativity, is time absolute or relative?
          </motion.div>
          <AnimatePresence mode="wait">
            {!showReply ? (
              <motion.div
                key="typing"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="hero-dash-agent-bubble"
              >
                <span className="hero-dash-typing">
                  <IntellectALogoMark className="h-3 w-3 text-[#d76d77]" />
                  Physics expert is typing
                  <TypingIndicator />
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="reply"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45 }}
                className="hero-dash-agent-bubble"
              >
                <span className="hero-dash-agent-tag">
                  <IntellectALogoMark className="h-3 w-3 text-[#d76d77]" />
                  Physics expert
                </span>
                <p className="hero-dash-agent-text">
                  Time is{" "}
                  <span className="hero-dash-agent-highlight">relative</span> —
                  moving clocks run slower. Two observers can disagree on
                  &ldquo;now&rdquo; without either being wrong.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="hero-dash-chips">
            {["Math", "Chem", "Hist"].map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.12 }}
                whileHover={{ scale: 1.05 }}
                className="hero-dash-chip"
              >
                {s}
              </motion.div>
            ))}
          </div>
          {embedded && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="hero-dash-online"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="hero-dash-online-dot"
              >
                <span className="hero-dash-online-ping animate-ping" />
                <span className="hero-dash-online-core" />
              </motion.span>
              <Activity className="h-4 w-4 text-[#ffca7b]" />
              <span>24/7 online</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, y: embedded ? 0 : [0, -6, 0] }}
        transition={{
          opacity: { delay: 0.5, duration: 0.5 },
          x: { delay: 0.5, duration: 0.5 },
          y: embedded
            ? undefined
            : { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 },
        }}
        className={`hero-dash-float hero-dash-float--response ${embedded ? "hero-dash-float--sm hero-dash-float--tr" : "hero-dash-float--tr-lg"}`}
      >
        <div className="hero-dash-float-icon hero-dash-float-icon--gold">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <p className="hero-dash-float-label">Response</p>
          <p className="hero-dash-float-value">&lt; 2s</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, y: embedded ? 0 : [0, 6, 0] }}
        transition={{
          opacity: { delay: 0.65, duration: 0.5 },
          x: { delay: 0.65, duration: 0.5 },
          y: embedded
            ? undefined
            : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
        }}
        className={`hero-dash-float hero-dash-float--subjects ${embedded ? "hero-dash-float--sm hero-dash-float--tl" : "hero-dash-float--tl-lg"}`}
      >
        <div className="hero-dash-float-icon hero-dash-float-icon--purple">
          <BookOpen className="h-4 w-4" />
        </div>
        <div>
          <p className="hero-dash-float-label">Subjects</p>
          <p className="hero-dash-float-value">8 experts</p>
        </div>
      </motion.div>

      {!embedded && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="hero-dash-online hero-dash-online--floating"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="hero-dash-online-dot"
          >
            <span className="hero-dash-online-ping animate-ping" />
            <span className="hero-dash-online-core" />
          </motion.span>
          <Activity className="h-4 w-4 text-[#ffca7b]" />
          <span>24/7 online</span>
        </motion.div>
      )}
    </div>
  );
}
