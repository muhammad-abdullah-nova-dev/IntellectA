"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MarkdownMessage } from "@/components/markdown-message-client";

interface TypingMessageProps {
  content: string;
  onComplete: () => void;
  speed?: number;
  skip?: boolean;
}

export function TypingMessage({
  content,
  onComplete,
  speed = 30,
  skip = false,
}: TypingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentIndex < content.length && !isComplete) {
      intervalRef.current = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
    } else if (currentIndex >= content.length && !isComplete) {
      setIsComplete(true);
      onComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentIndex, content, speed, isComplete, onComplete]);

  useEffect(() => {
    setDisplayedContent("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [content]);

  useEffect(() => {
    if (!skip || isComplete) return;
    setDisplayedContent(content);
    setCurrentIndex(content.length);
    setIsComplete(true);
    onComplete();
  }, [skip, content, isComplete, onComplete]);

  return (
    <div className="relative">
      <MarkdownMessage content={displayedContent} />
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="ml-1 inline-block h-4 w-2 bg-cyan-500"
        />
      )}
    </div>
  );
}
