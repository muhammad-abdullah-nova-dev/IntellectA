"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { AuthGuard } from "@/components/auth-guard";
import { IntellectAIcon } from "@/components/brand/intellecta-logo";
import { Cloud, Menu, Plus, PanelLeftClose, Sparkles } from "lucide-react";
import type { Chat, Message } from "@/types/chat";
import type { AuthUser } from "@/types/auth";
import {
  chatsStorageKey,
  getStoredUser,
  migrateLegacyChatsKey,
  SIDEBAR_WIDTH_KEY,
  LEGACY_SIDEBAR_WIDTH_KEY,
} from "@/lib/auth";
import { authApi } from "@/utils/auth-api";
import { sessionsApi } from "@/utils/sessions-api";
import { motion, AnimatePresence } from "framer-motion";

function newChatId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function ChatAppContent() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isInitialized, setIsInitialized] = useState(false);
  const loadedMessageIdsRef = useRef<Set<string>>(new Set());

  const createEmptyChat = useCallback((): Chat => {
    const now = new Date();
    return {
      id: newChatId(),
      title: "New conversation",
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
  }, []);

  const loadMessagesForChat = useCallback(async (chatId: string) => {
    if (loadedMessageIdsRef.current.has(chatId)) return;
    try {
      const messages = await sessionsApi.getSessionMessages(chatId);
      loadedMessageIdsRef.current.add(chatId);
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId ? { ...c, messages, updatedAt: new Date() } : c
        )
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const currentUser = getStoredUser();
      setUser(currentUser);
      if (currentUser?.id) migrateLegacyChatsKey(currentUser.id);

      const legacySidebar = localStorage.getItem(LEGACY_SIDEBAR_WIDTH_KEY);
      if (legacySidebar && !localStorage.getItem(SIDEBAR_WIDTH_KEY)) {
        localStorage.setItem(SIDEBAR_WIDTH_KEY, legacySidebar);
      }
      const savedSidebarWidth = localStorage.getItem(SIDEBAR_WIDTH_KEY);
      if (savedSidebarWidth) setSidebarWidth(Number.parseInt(savedSidebarWidth));

      if (currentUser) {
        try {
          const summaries = await sessionsApi.listSessions();
          if (cancelled) return;

          if (summaries.length > 0) {
            const serverChats = summaries.map((s) =>
              sessionsApi.summaryToChat(s)
            );
            setChats(serverChats);
            setActiveChat(serverChats[0].id);
            await loadMessagesForChat(serverChats[0].id);
          } else {
            const nc = createEmptyChat();
            setChats([nc]);
            setActiveChat(nc.id);
          }
        } catch (err) {
          console.error("Server history load failed, using local cache:", err);
          const storageKey = chatsStorageKey(currentUser.id);
          const savedChats = localStorage.getItem(storageKey);
          if (savedChats) {
            const parsed = JSON.parse(savedChats).map((chat: Chat) => ({
              ...chat,
              createdAt: new Date(chat.createdAt),
              updatedAt: new Date(chat.updatedAt),
              messages: chat.messages.map((m: Message) => ({
                ...m,
                timestamp: new Date(m.timestamp),
              })),
            }));
            const nonEmpty = parsed.filter((c: Chat) => c.messages.length > 0);
            if (nonEmpty.length > 0) {
              setChats(nonEmpty);
              setActiveChat(nonEmpty[0].id);
            } else {
              const nc = createEmptyChat();
              setChats([nc]);
              setActiveChat(nc.id);
            }
          } else {
            const nc = createEmptyChat();
            setChats([nc]);
            setActiveChat(nc.id);
          }
        }
      } else {
        const nc = createEmptyChat();
        setChats([nc]);
        setActiveChat(nc.id);
      }

      if (!cancelled) setIsInitialized(true);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [createEmptyChat, loadMessagesForChat]);

  useEffect(() => {
    if (isInitialized && chats.length > 0 && user) {
      localStorage.setItem(chatsStorageKey(user.id), JSON.stringify(chats));
    }
  }, [chats, isInitialized, user]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  const handleSelectChat = async (chatId: string) => {
    setActiveChat(chatId);
    await loadMessagesForChat(chatId);
  };

  const handleLogout = () => {
    authApi.logout();
    router.replace("/login");
  };

  const createNewChat = () => {
    const nc = createEmptyChat();
    setChats((p) => [nc, ...p]);
    setActiveChat(nc.id);
  };

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    setChats((p) =>
      p.map((c) =>
        c.id === chatId ? { ...c, ...updates, updatedAt: new Date() } : c
      )
    );
  };

  const deleteChat = async (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat && chat.messages.length > 0) {
      try {
        await sessionsApi.deleteSession(chatId);
      } catch (err) {
        console.error("Delete on server failed:", err);
      }
    }
    loadedMessageIdsRef.current.delete(chatId);
    setChats((p) => {
      const filtered = p.filter((c) => c.id !== chatId);
      if (activeChat === chatId && filtered.length > 0) setActiveChat(filtered[0].id);
      else if (filtered.length === 0) {
        const nc = createEmptyChat();
        setActiveChat(nc.id);
        return [nc];
      }
      return filtered;
    });
  };

  const addMessage = (chatId: string, message: Message) => {
    setChats((p) =>
      p.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, message], updatedAt: new Date() }
          : c
      )
    );
    loadedMessageIdsRef.current.add(chatId);
  };

  const setChatMessages = (chatId: string, messages: Message[]) => {
    setChats((p) =>
      p.map((c) =>
        c.id === chatId ? { ...c, messages, updatedAt: new Date() } : c
      )
    );
  };

  const currentChat = chats.find((c) => c.id === activeChat);

  if (!isInitialized) {
    return (
      <div className="dockit-page flex h-screen flex-col items-center justify-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <IntellectAIcon size={64} className="rounded-2xl" />
        </motion.div>
        <div className="text-center">
          <p className="font-semibold text-[#f6f6f6]">Loading your workspace</p>
          <p className="mt-1 text-sm text-[#999]">
            Syncing conversations from cloud…
          </p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="dockit-loading-dot"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dockit-page dockit-chat-shell">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: sidebarWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex h-full shrink-0 overflow-hidden"
          >
            <ChatSidebar
              chats={chats}
              activeChat={activeChat}
              user={user}
              onSelectChat={handleSelectChat}
              onDeleteChat={deleteChat}
              onRenameChat={(id, title) => updateChat(id, { title })}
              onTogglePin={(id) =>
                setChats((p) =>
                  p.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
                )
              }
              onNewChat={createNewChat}
              onLogout={handleLogout}
              width={sidebarWidth}
              onWidthChange={setSidebarWidth}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="dockit-chat-main">
        <header className="dockit-chat-topbar sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="dockit-icon-btn shrink-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
            <div className="min-w-0">
              <h1 className="truncate">
                {currentChat?.title || "New conversation"}
              </h1>
              <div className="flex items-center gap-2">
                <p className="truncate text-[11px] text-[#999]">
                  {user?.name || user?.email}
                </p>
                {user && (
                  <span className="dockit-sync-pill hidden sm:inline-flex !mt-0 !py-0.5">
                    <Cloud className="h-2.5 w-2.5" />
                    Synced
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="dockit-specialists-pill">
              <Sparkles className="h-3 w-3" />
              8 specialists
            </span>
            <button
              type="button"
              onClick={createNewChat}
              className="btn-primary btn-sm"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">New chat</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1">
          {currentChat && (
            <ChatInterface
              key={currentChat.id}
              chat={currentChat}
              onAddMessage={addMessage}
              onSetMessages={setChatMessages}
              onUpdateTitle={(id, msg) => {
                const title = msg.length > 36 ? `${msg.slice(0, 36)}…` : msg;
                updateChat(id, { title });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatAppContent />
    </AuthGuard>
  );
}
