"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { IntellectAWordmark } from "@/components/brand/intellecta-logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import type { Chat } from "@/types/chat";
import type { AuthUser } from "@/types/auth";
import {
  Plus,
  Trash2,
  MoreHorizontal,
  Clock,
  Edit2,
  Check,
  X,
  Star,
  Pin,
  LogOut,
  Search,
  Cloud,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

function getUserInitials(user: AuthUser): string {
  const name = user.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  user: AuthUser | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onTogglePin: (chatId: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
  width: number;
  onWidthChange: (width: number) => void;
}

export function ChatSidebar({
  chats,
  activeChat,
  user,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onTogglePin,
  onNewChat,
  onLogout,
  width,
  onWidthChange,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = Math.max(240, Math.min(480, e.clientX));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, onWidthChange]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingChat && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChat]);

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Unknown";
    }

    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return dateObj.toLocaleDateString();
    }
  };

  const sortByUpdated = (a: Chat, b: Chat) => {
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();
    return bTime - aTime;
  };

  const groupChatsByDate = (allChats: Chat[]) => {
    const groups: { [key: string]: Chat[] } = {};
    const pinned = allChats.filter((c) => c.pinned).sort(sortByUpdated);
    const unpinned = allChats.filter((c) => !c.pinned);

    if (pinned.length > 0) {
      groups["Pinned"] = pinned;
    }

    unpinned.forEach((chat) => {
      const now = new Date();
      const dateObj =
        chat.updatedAt instanceof Date
          ? chat.updatedAt
          : new Date(chat.updatedAt);

      if (isNaN(dateObj.getTime())) {
        if (!groups["Unknown"]) groups["Unknown"] = [];
        groups["Unknown"].push(chat);
        return;
      }

      const diffInHours =
        (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);

      let group = "";
      if (diffInHours < 24) {
        group = "Today";
      } else if (diffInHours < 48) {
        group = "Yesterday";
      } else if (diffInHours < 168) {
        group = "This Week";
      } else {
        group = "Older";
      }

      if (!groups[group]) groups[group] = [];
      groups[group].push(chat);
    });

    Object.keys(groups).forEach((key) => {
      if (key !== "Pinned") {
        groups[key].sort(sortByUpdated);
      }
    });

    return groups;
  };

  const groupOrder = ["Pinned", "Today", "Yesterday", "This Week", "Older", "Unknown"];
  const filteredChats = searchQuery.trim()
    ? chats.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : chats;
  const chatGroups = groupChatsByDate(filteredChats);
  const orderedGroups = groupOrder.filter((g) => chatGroups[g]?.length);

  const handleChatMouseEnter = (chatId: string) => {
    setHoveredChat(chatId);
  };

  const handleChatMouseLeave = (chatId: string) => {
    if (openDropdown !== chatId && editingChat !== chatId) {
      setHoveredChat(null);
    }
  };

  const handleDropdownOpenChange = (open: boolean, chatId: string) => {
    if (open) {
      setOpenDropdown(chatId);
      setHoveredChat(chatId);
    } else {
      setOpenDropdown(null);
      setHoveredChat(null);
    }
  };

  const startEditing = (chat: Chat) => {
    setEditingChat(chat.id);
    setEditTitle(chat.title);
    setOpenDropdown(null);
  };

  const saveEdit = () => {
    if (editingChat && editTitle.trim()) {
      onRenameChat(editingChat, editTitle.trim());
    }
    setEditingChat(null);
    setEditTitle("");
    setHoveredChat(null);
  };

  const cancelEdit = () => {
    setEditingChat(null);
    setEditTitle("");
    setHoveredChat(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  return (
    <div
      ref={sidebarRef}
      className="dockit-chat-sidebar relative"
      style={{ width }}
    >
      <div className="dockit-chat-sidebar-inner">
        <div className="dockit-chat-sidebar-header">
          <div className="mb-3 min-w-0">
            <IntellectAWordmark width={118} className="h-7" />
            <p className="mt-1 text-[11px] text-[#999]">Learning workspace</p>
          </div>
          <button
            type="button"
            onClick={onNewChat}
            className="btn-primary btn-block h-10 w-full text-sm"
          >
            <Plus className="h-4 w-4" />
            New conversation
          </button>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#999]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats…"
              className="dockit-chat-search"
            />
          </div>

          {user && (
            <div className="dockit-sync-pill">
              <Cloud className="h-3 w-3" />
              Synced to cloud
            </div>
          )}
        </div>

        {/* Chat List */}
        <ScrollArea className="dockit-chat-scroll min-h-0 flex-1">
          <div className="p-2">
            {orderedGroups.length === 0 && searchQuery.trim() && (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                No chats match &ldquo;{searchQuery}&rdquo;
              </p>
            )}
            {orderedGroups.map((group) => {
              const groupChats = chatGroups[group];
              return (
              <div key={group} className="mb-4">
                <div className="mb-1 flex items-center gap-1 px-2 py-1">
                  {group === "Pinned" ? (
                    <Pin className="h-2.5 w-2.5 text-[#ffca7b]" />
                  ) : (
                    <Clock className="h-2.5 w-2.5 text-[#999]" />
                  )}
                  <span className="dockit-chat-group-label">{group}</span>
                </div>
                <AnimatePresence>
                  {groupChats.map((chat, index) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.02 }}
                      className={`dockit-chat-item group relative ${
                        activeChat === chat.id ? "active" : ""
                      } ${chat.pinned && activeChat !== chat.id ? "border border-[#ffca7b33]" : ""}`}
                      onMouseEnter={() => handleChatMouseEnter(chat.id)}
                      onMouseLeave={() => handleChatMouseLeave(chat.id)}
                      onClick={() => !editingChat && onSelectChat(chat.id)}
                    >
                      <div className="flex items-center p-2 gap-2">
                        <div className="dockit-chat-item-dot" />

                        <div className="flex-1 min-w-0">
                          {editingChat === chat.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                ref={editInputRef}
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                onBlur={saveEdit}
                                className="h-6 text-xs px-1 py-0 border-sky-300 dark:border-sky-600"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-green-600 hover:text-green-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveEdit();
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-red-600 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEdit();
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="dockit-chat-item-title truncate">
                                {chat.title}
                              </div>
                              <div className="dockit-chat-item-meta flex items-center gap-2">
                                <span>{formatDate(chat.updatedAt)}</span>
                                {chat.messages.length > 0 && (
                                  <span className="inline-flex items-center gap-0.5">
                                    <MessageSquare className="h-2.5 w-2.5" />
                                    {chat.messages.length}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-5 w-5 p-0 transition-opacity ${
                              chat.pinned
                                ? "text-amber-500 opacity-100"
                                : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-500"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin(chat.id);
                            }}
                            title={chat.pinned ? "Unpin chat" : "Pin chat"}
                          >
                            <Star
                              className={`h-3 w-3 ${chat.pinned ? "fill-current" : ""}`}
                            />
                          </Button>

                        <AnimatePresence>
                          {(hoveredChat === chat.id ||
                            activeChat === chat.id ||
                            openDropdown === chat.id) &&
                            !editingChat && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                              >
                                <DropdownMenu
                                  onOpenChange={(open) =>
                                    handleDropdownOpenChange(open, chat.id)
                                  }
                                  open={openDropdown === chat.id}
                                >
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-32"
                                  >
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onTogglePin(chat.id);
                                        setOpenDropdown(null);
                                      }}
                                      className="text-slate-600 focus:text-slate-600 dark:text-slate-400 focus:bg-slate-50 dark:focus:bg-slate-800"
                                    >
                                      <Star
                                        className={`h-3 w-3 mr-2 ${chat.pinned ? "fill-amber-500 text-amber-500" : ""}`}
                                      />
                                      {chat.pinned ? "Unpin" : "Pin"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(chat);
                                      }}
                                      className="text-slate-600 focus:text-slate-600 dark:text-slate-400 focus:bg-slate-50 dark:focus:bg-slate-800"
                                    >
                                      <Edit2 className="h-3 w-3 mr-2" />
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChat(chat.id);
                                        setOpenDropdown(null);
                                        setHoveredChat(null);
                                      }}
                                      className="text-red-600 focus:text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20"
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </motion.div>
                            )}
                        </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            );
            })}
          </div>
        </ScrollArea>

        <div className="dockit-chat-sidebar-footer">
          {user && (
            <div className="dockit-user-card mb-2">
              <div className="flex items-center gap-2.5 p-2.5">
                <div className="dockit-user-avatar">{getUserInitials(user)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#f6f6f6]">
                    {user.name || "Student"}
                  </p>
                  <p className="truncate text-[11px] text-[#999]">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center justify-center gap-2 border-t border-[#272727] px-2.5 py-2 text-xs font-medium text-[#999] transition-colors hover:bg-[#151515] hover:text-[#ff8585]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
          <p className="text-center text-[10px] font-medium tracking-wide text-[#999]">
            IntellectA <span className="opacity-40">·</span> v2
          </p>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="dockit-resize-handle w-1 cursor-col-resize bg-transparent transition-colors flex items-center justify-center group"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-600 group-hover:bg-cyan-500 dark:group-hover:bg-cyan-500 transition-colors rounded-full opacity-0 group-hover:opacity-100" />
      </div>
    </div>
  );
}
