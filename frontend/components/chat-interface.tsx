"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chat, Message } from "@/types/chat";
import {
  Send,
  User,
  Bot,
  Copy,
  Check,
  BookOpen,
  Lightbulb,
  GraduationCap,
  ImagePlus,
  X,
  Square,
  RotateCcw,
  Clock,
  Atom,
  type LucideIcon,
} from "lucide-react";
import { chatApi } from "@/utils/api";
import {
  prepareImageForUpload,
  parseDataUrlImage,
  type PreparedImage,
} from "@/utils/image-upload";
import { motion, AnimatePresence } from "framer-motion";
import { TypingMessage } from "@/components/typing-message";
import { MarkdownMessage } from "@/components/markdown-message-client";
import { AgentBadge } from "@/components/agent-badge";
import { LogoAvatar, LogoIcon } from "@/components/brand/logo";
import { SUBJECTS } from "@/lib/subjects";
import { SubjectIcon } from "@/components/subject-icon";
interface ChatInterfaceProps {
  chat: Chat;
  onAddMessage: (chatId: string, message: Message) => void;
  onSetMessages: (chatId: string, messages: Message[]) => void;
  onUpdateTitle: (chatId: string, firstMessage: string) => void;
}

export function ChatInterface({
  chat,
  onAddMessage,
  onSetMessages,
  onUpdateTitle,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [skipTyping, setSkipTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<PreparedImage | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [typingMessage, setTypingMessage] = useState<{
    id: string;
    content: string;
    agent?: string;
  } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isBusy = isLoading || !!typingMessage;

  useEffect(() => {
    if (chat.messages.length > 0) return;
    const seed = sessionStorage.getItem("intellecta_seed_prompt");
    if (seed) {
      setInput(seed);
      sessionStorage.removeItem("intellecta_seed_prompt");
    }
  }, [chat.id, chat.messages.length]);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  // Auto-scroll to bottom when new messages are added or during typing
  useEffect(() => {
    scrollToBottom();
  }, [chat.messages, typingMessage]);

  // Continuous scroll during typing animation
  useEffect(() => {
    if (typingMessage) {
      const interval = setInterval(scrollToBottom, 100);
      return () => clearInterval(interval);
    }
  }, [typingMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  const showAssistantReply = (responseContent: string, agent?: string) => {
    setSkipTyping(false);
    setTypingMessage({
      id: `assistant-${Date.now()}`,
      content: responseContent,
      agent,
    });
  };

  const toApiHistory = (messages: Message[]) =>
    messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

  const fetchAssistantReply = async (
    historyMessages: Message[],
    options?: { imagePayload?: PreparedImage; userNote?: string }
  ) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);

    try {
      let response;
      if (options?.imagePayload) {
        response = await chatApi.sendImageMessage(
          {
            image: options.imagePayload.base64,
            mimeType: options.imagePayload.mimeType,
            text: options.userNote,
          },
          controller.signal,
          { sessionId: chat.id }
        );
      } else {
        response = await chatApi.sendMessage(
          toApiHistory(historyMessages),
          controller.signal,
          { sessionId: chat.id }
        );
      }

      const responseContent =
        response.message ||
        response.response ||
        "Sorry, I could not process your request.";

      showAssistantReply(responseContent, response.agent);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error("Error sending message:", error);
      const errorContent =
        error instanceof Error
          ? error.message
          : "Sorry, there was an error processing your request. Please try again.";
      showAssistantReply(errorContent, "Unknown");
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (isLoading) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      return;
    }
    if (typingMessage) {
      setSkipTyping(true);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImageError(null);
    try {
      const prepared = await prepareImageForUpload(file);
      setPendingImage(prepared);
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "Could not load that image."
      );
      setPendingImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if ((!text && !pendingImage) || isBusy) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text || "Question from uploaded image",
      timestamp: new Date(),
      ...(pendingImage ? { imageUrl: pendingImage.dataUrl } : {}),
    };

    const imagePayload = pendingImage;
    setInput("");
    setPendingImage(null);
    setImageError(null);

    onAddMessage(chat.id, userMessage);

    if (chat.messages.length === 0) {
      onUpdateTitle(
        chat.id,
        text || "Image question"
      );
    }

    await fetchAssistantReply([...chat.messages, userMessage], {
      imagePayload: imagePayload ?? undefined,
      userNote: text,
    });
  };

  const handleRegenerate = async () => {
    if (isBusy) return;

    const messages = chat.messages;
    let lastAssistantIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") {
        lastAssistantIndex = i;
        break;
      }
    }
    if (lastAssistantIndex === -1) return;

    const trimmed = messages.slice(0, lastAssistantIndex);
    const lastUser = [...trimmed].reverse().find((m) => m.role === "user");
    if (!lastUser) return;

    onSetMessages(chat.id, trimmed);

    if (lastUser.imageUrl) {
      const parsed = parseDataUrlImage(lastUser.imageUrl);
      if (!parsed) return;
      const note =
        lastUser.content !== "Question from uploaded image"
          ? lastUser.content
          : "";
      await fetchAssistantReply(trimmed, {
        imagePayload: {
          base64: parsed.base64,
          mimeType: parsed.mimeType,
          dataUrl: lastUser.imageUrl,
        },
        userNote: note,
      });
    } else {
      await fetchAssistantReply(trimmed);
    }
  };

  const handleTypingComplete = () => {
    if (typingMessage) {
      const assistantMessage: Message = {
        id: typingMessage.id,
        role: "assistant",
        content: typingMessage.content,
        timestamp: new Date(),
        ...(typingMessage.agent ? { agent: typingMessage.agent } : {}),
      };

      onAddMessage(chat.id, assistantMessage);
      setTypingMessage(null);
      setSkipTyping(false);
    }
  };

  const lastAssistantId =
    [...chat.messages].reverse().find((m) => m.role === "assistant")?.id ??
    null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Unknown";
    }

    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const suggestedPrompts: { text: string; icon: LucideIcon; tag: string }[] = [
    { tag: "Physics", text: "Explain Newton's three laws with everyday examples", icon: Atom },
    { tag: "Math", text: "How do I solve quadratic equations using the formula?", icon: Lightbulb },
    { tag: "Biology", text: "What is photosynthesis and why is it important?", icon: BookOpen },
    { tag: "Chemistry", text: "Explain ionic vs covalent bonds", icon: GraduationCap },
    { tag: "History", text: "What caused World War I?", icon: Clock },
    { tag: "Economics", text: "Explain supply and demand with a real example", icon: Bot },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Custom CSS for fractions */}
      <style jsx>{`
        .fraction {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.9em;
          margin: 0 2px;
          vertical-align: middle;
        }
        .numerator {
          border-bottom: 1px solid currentColor;
          padding-bottom: 1px;
          line-height: 1;
        }
        .denominator {
          padding-top: 1px;
          line-height: 1;
        }
      `}</style>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-4 sm:px-6" ref={scrollAreaRef}>
        <div className="mx-auto w-full max-w-5xl space-y-6">
          {chat.messages.length === 0 && !typingMessage ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center px-2 py-8 sm:py-14"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="dockit-chat-empty-icon mb-6"
              >
                <LogoIcon size="2xl" />
              </motion.div>
              <h3 className="dockit-chat-empty-title">
                What do you want to{" "}
                <span className="gradient-text">learn today?</span>
              </h3>
              <p className="mt-3 max-w-lg text-center text-sm leading-relaxed text-[#999] sm:text-base">
                Eight subject specialists ready — ask anything academic, upload a
                diagram, or say &quot;quiz me&quot; for adaptive testing.
              </p>

              <div className="mt-8 grid w-full max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
                {SUBJECTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        setInput(`Help me understand a core concept in ${s.name}`)
                      }
                      className="dockit-subject-tile group !p-3"
                    >
                      <SubjectIcon subject={s} size="md" />
                      <span className="!text-[11px]">{s.name}</span>
                    </button>
                ))}
              </div>

              <p className="dockit-chat-group-label mt-8">
                Try a starter prompt
              </p>

              <div className="mt-4 grid w-full max-w-3xl grid-cols-1 gap-2.5 sm:grid-cols-2">
                {suggestedPrompts.map(({ text, icon: Icon, tag }, index) => (
                  <motion.button
                    key={text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index }}
                    whileHover={{ y: -2 }}
                    onClick={() => setInput(text)}
                    className="dockit-prompt-card group"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="dockit-prompt-tag">{tag}</span>
                      <Icon className="h-4 w-4 text-[#999] group-hover:text-[#d76d77]" />
                    </div>
                    <span className="text-sm leading-snug text-[#ccc]">
                      {text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {chat.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <LogoAvatar size="md" />
                  )}

                  <div
                    className={`group max-w-[82%] sm:max-w-[75%] ${
                      message.role === "user" ? "order-1" : ""
                    }`}
                  >
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      whileHover={{ y: -1 }}
                      className={`p-4 ${
                        message.role === "user"
                          ? "chat-bubble-user"
                          : "chat-bubble-assistant"
                      }`}
                    >
                      {message.role === "user" ? (
                        <div className="space-y-2">
                          {message.imageUrl && (
                            <img
                              src={message.imageUrl}
                              alt="Uploaded question"
                              className="max-h-48 w-full rounded-lg border border-white/20 object-contain"
                            />
                          )}
                          {message.content &&
                            message.content !== "Question from uploaded image" && (
                              <div className="whitespace-pre-wrap break-words leading-relaxed">
                                {message.content}
                              </div>
                            )}
                          {message.imageUrl &&
                            message.content === "Question from uploaded image" && (
                              <p className="text-sm text-white/80">
                                Image question
                              </p>
                            )}
                        </div>
                      ) : (
                        <>
                          {message.agent && (
                            <div className="mb-2">
                              <AgentBadge agent={message.agent} />
                            </div>
                          )}
                          <MarkdownMessage content={message.content} />
                        </>
                      )}
                    </motion.div>

                    <div
                      className={`flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400 ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <span>{formatTime(message.timestamp)}</span>
                      {message.role === "assistant" && (
                        <>
                          {message.id === lastAssistantId && !isBusy && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 gap-1 px-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                              onClick={handleRegenerate}
                              title="Regenerate response"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span className="hidden sm:inline">Regenerate</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={() =>
                              copyToClipboard(message.content, message.id)
                            }
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shadow-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Message */}
              {typingMessage && (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 justify-start"
                >
                  <LogoAvatar size="md" />
                  <div className="group max-w-[82%] sm:max-w-[75%]">
                    <div className="chat-bubble-assistant p-4">
                      {typingMessage.agent && (
                        <div className="mb-2">
                          <AgentBadge agent={typingMessage.agent} />
                        </div>
                      )}
                      <TypingMessage
                        content={typingMessage.content}
                        onComplete={handleTypingComplete}
                        speed={20}
                        skip={skipTyping}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <AnimatePresence>
            {isLoading && !typingMessage && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-4 justify-start"
              >
                <LogoAvatar size="md" />
                <div className="chat-bubble-assistant p-4">
                  <div className="flex space-x-2">
                    <motion.div
                      className="dockit-loading-dot"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: 0,
                      }}
                    />
                    <motion.div
                      className="dockit-loading-dot"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: 0.2,
                      }}
                    />
                    <motion.div
                      className="dockit-loading-dot"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: 0.4,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="dockit-chat-input-bar sm:p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          {pendingImage && (
            <div className="mb-3 flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/80 p-2 dark:border-slate-700/70 dark:bg-slate-800/50">
              <img
                src={pendingImage.dataUrl}
                alt="Preview"
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Image attached
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Max 4 MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0"
                onClick={() => {
                  setPendingImage(null);
                  setImageError(null);
                }}
                disabled={isBusy}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {isBusy && (
            <div className="mb-2 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStop}
                className="h-8 gap-2 rounded-full border-slate-300 bg-white/90 text-xs text-slate-700 shadow-sm hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:border-red-800 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                <Square className="h-3 w-3 fill-current" />
                {isLoading ? "Stop generating" : "Skip animation"}
              </Button>
            </div>
          )}
          <div className="dockit-chat-input-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageSelect}
              disabled={isBusy}
            />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                pendingImage
                  ? "Add a note about your image (optional)…"
                  : "Ask anything academic — or say 'quiz me on…'"
              }
              className="dockit-chat-textarea"
              disabled={isBusy}
              rows={1}
            />
            <div className="dockit-chat-input-actions">
              <button
                type="button"
                className="dockit-icon-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                title="Upload image"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
              {isBusy ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="dockit-icon-btn dockit-icon-btn-danger"
                  title="Stop"
                >
                  <Square className="h-4 w-4 fill-white text-white" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() && !pendingImage}
                  className="btn-primary btn-icon disabled:opacity-40"
                  title="Send message"
                >
                  <Send className="h-4 w-4 shrink-0" />
                </button>
              )}
            </div>
          </div>
          {imageError && (
            <p className="mt-2 text-center text-xs text-red-500">{imageError}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[11px] text-[#999]">
            <span>
              <kbd className="rounded-md border border-[#272727] bg-[#040404] px-1.5 py-0.5 font-mono text-[10px] text-[#ccc]">
                Enter
              </kbd>{" "}
              send
            </span>
            <span>
              <kbd className="rounded-md border border-[#272727] bg-[#040404] px-1.5 py-0.5 font-mono text-[10px] text-[#ccc]">
                Shift+Enter
              </kbd>{" "}
              new line
            </span>
            <span>Images up to 4 MB</span>
          </div>
        </form>
      </div>
    </div>
  );
}
