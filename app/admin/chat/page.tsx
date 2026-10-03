"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Send, MessageCircle, Search, RefreshCw, ArrowLeft, Users, MoreVertical,
  Phone, Video, Paperclip, Smile, X, Trash2, Reply, Pin,
  Check, CheckCheck, Clock, UserPlus, Star, Archive, Settings,
  Filter, SortAsc, Bell, ArchiveX, Inbox, Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { Authenticated, Unauthenticated } from "convex/react";
import { cn } from "@/lib/utils";

interface Conversation {
  _id: Id<"conversations">;
  participant: {
    _id: Id<"users">;
    name: string | null;
    email: string | null;
    image: string | null | undefined;
  };
  lastMessage: string | null;
  lastMessageAt: number | null;
  unreadCount: number;
}

interface Message {
  _id: Id<"messages">;
  conversationId: Id<"conversations">;
  senderId: Id<"users">;
  content: string;
  isRead: boolean;
  senderName: string;
  senderImage: string | null | undefined;
  _creationTime: number;
}

const QUICK_REPLIES = [
  "Hello! How can I help you today?",
  "Thanks for reaching out! I'll get back to you shortly.",
  "Could you please provide more details?",
  "I understand. Let me check that for you.",
  "Is there anything else I can help with?",
];

export default function AdminChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "archived">("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [showNewChat, setShowNewChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUser = useQuery(api.users.viewer, {});
  const conversations = useQuery(api.chat.listConversations, {});
  const unreadCount = useQuery(api.chat.getUnreadCount, {});
  const messages = useQuery(api.chat.listMessages, selectedConversationId ? { conversationId: selectedConversationId } : "skip");
  const sendMessage = useMutation(api.chat.sendMessage);
  const markAsRead = useMutation(api.chat.markAsRead);
  const deleteConversation = useMutation(api.chat.deleteConversation);
  const allUsers = useQuery(api.users.listUsers, {});

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead({ conversationId: selectedConversationId });
    }
  }, [selectedConversationId, markAsRead]);

  // Play notification sound when new messages arrive
  useEffect(() => {
    if (unreadCount && unreadCount > previousUnreadCount && previousUnreadCount >= 0) {
      playNotificationSound();
    }
    setPreviousUnreadCount(unreadCount || 0);
  }, [unreadCount, previousUnreadCount]);

  const playNotificationSound = () => {
    // Use browser's built-in notification sound via AudioContext
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversationId) return;

    try {
      const selectedConv = conversations?.find(c => c._id === selectedConversationId);
      if (!selectedConv) return;

      await sendMessage({
        receiverId: selectedConv.participant._id,
        content: message.trim(),
      });

      setMessage("");
      setReplyingTo(null);
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleQuickReply = (reply: string) => {
    setMessage(reply);
    inputRef.current?.focus();
  };

  const handleReply = (msg: Message) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
  };

  const groupedMessages = React.useMemo(() => {
    if (!messages) return [];

    const groups: { [key: string]: Message[] } = {};

    messages.forEach((msg) => {
      const date = new Date(msg._creationTime);
      let groupKey: string;

      if (isToday(date)) {
        groupKey = "Today";
      } else if (isYesterday(date)) {
        groupKey = "Yesterday";
      } else {
        groupKey = format(date, "MMMM d, yyyy");
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(msg);
    });

    return groups;
  }, [messages]);

  const filteredAndSortedConversations = React.useMemo(() => {
    let filtered = conversations || [];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter((conv) =>
        conv.participant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participant.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filter
    if (filterStatus === "unread") {
      filtered = filtered.filter((conv) => conv.unreadCount > 0);
    } else if (filterStatus === "archived") {
      // Placeholder for archived logic
      filtered = [];
    }

    // Apply sort
    if (sortBy === "recent") {
      filtered = [...filtered].sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
    } else {
      filtered = [...filtered].sort((a, b) => (a.lastMessageAt || 0) - (b.lastMessageAt || 0));
    }

    return filtered;
  }, [conversations, searchQuery, filterStatus, sortBy]);

  const selectedConversation = conversations?.find((c) => c._id === selectedConversationId);

  // Filter out admins from user list for starting new chats
  const regularUsers = allUsers?.filter(
    (user: any) => user.role !== "admin" && user.role !== "superadmin" && user.role !== "staff"
  ) || [];

  const handleStartChat = async (userId: Id<"users">) => {
    // Check if conversation already exists
    const existingConv = conversations?.find(c => c.participant._id === userId);
    if (existingConv) {
      setSelectedConversationId(existingConv._id);
    } else {
      // Need to create a new conversation by sending a message
      // For now, just select the user and let sendMessage handle conversation creation
      setSelectedConversationId(null);
      // The sendMessage mutation will create the conversation
    }
    setShowNewChat(false);
  };

  const handleDeleteConversation = async (conversationId: Id<"conversations">) => {
    try {
      await deleteConversation({ conversationId });
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  return (
    <Authenticated>
      <div className="h-[calc(100vh-4rem)] flex bg-background overflow-hidden">
        {/* Sidebar - Conversations List */}
        <div className={`${selectedConversationId ? 'hidden md:flex' : 'flex'} w-80 lg:w-96 border-r bg-card flex flex-col shadow-sm h-full overflow-hidden flex-shrink-0`}>
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5" />
                <h2 className="font-semibold text-lg">Inbox</h2>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount && unreadCount > 0 && (
                  <Badge className="bg-primary-foreground text-primary text-xs px-2 py-0.5 rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewChat(true)}
                  className="hover:bg-primary-foreground/20 text-primary-foreground h-8 w-8"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/20 text-primary-foreground h-8 w-8">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                      <Inbox className="w-4 h-4 mr-2" />
                      All Conversations
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("unread")}>
                      <Bell className="w-4 h-4 mr-2" />
                      Unread Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("archived")}>
                      <ArchiveX className="w-4 h-4 mr-2" />
                      Archived
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy("recent")}>
                      <SortAsc className="w-4 h-4 mr-2 rotate-180" />
                      Most Recent
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                      <SortAsc className="w-4 h-4 mr-2" />
                      Oldest First
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/60" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b bg-card">
            <button
              onClick={() => setFilterStatus("all")}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                filterStatus === "all" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("unread")}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                filterStatus === "unread" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Unread
            </button>
            <button
              onClick={() => setFilterStatus("archived")}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                filterStatus === "archived" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Archived
            </button>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1 h-full">
            {filteredAndSortedConversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Inbox className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm">No conversations found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredAndSortedConversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedConversationId(conv._id)}
                    className={cn(
                      "w-full p-3 rounded-xl transition-all text-left flex items-center gap-3 relative group",
                      selectedConversationId === conv._id
                        ? "bg-primary/10 border-2 border-primary shadow-sm"
                        : "hover:bg-muted border-2 border-transparent"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12 ring-2 ring-background shadow-sm">
                        <AvatarImage src={conv.participant.image || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {conv.participant.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {conv.unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 p-0 flex items-center justify-center rounded-full">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate">{conv.participant.name || "Unknown"}</p>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(conv.lastMessageAt, { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage || "No messages"}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Star className="w-4 h-4 mr-2" />
                            Star conversation
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pin className="w-4 h-4 mr-2" />
                            Pin conversation
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteConversation(conv._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete conversation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className={`${selectedConversationId ? 'flex' : 'hidden md:flex'} flex-1 flex flex-col overflow-hidden`}>
          {selectedConversationId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-card flex items-center gap-3 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedConversationId(null)}
                  className="md:hidden flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="relative">
                  <Avatar className="w-11 h-11 ring-2 ring-primary/10">
                    <AvatarImage src={selectedConversation?.participant.image || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedConversation?.participant.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base">{selectedConversation?.participant.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{selectedConversation?.participant.email}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="hover:bg-muted h-9 w-9">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-muted h-9 w-9">
                    <Video className="w-5 h-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="hover:bg-muted h-9 w-9">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="w-4 h-4 mr-2" />
                        Star conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pin className="w-4 h-4 mr-2" />
                        Pin conversation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => selectedConversationId && handleDeleteConversation(selectedConversationId)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 md:p-6 bg-gradient-to-b from-muted/50 to-background h-full overflow-hidden" ref={scrollRef}>
                {messages && messages.length > 0 ? (
                  <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
                    {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                      <div key={dateLabel}>
                        <div className="flex items-center justify-center my-4">
                          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {dateLabel}
                          </span>
                        </div>
                        {msgs.map((msg) => {
                          const isAdmin = msg.senderId === currentUser?._id;
                          return (
                            <div
                              key={msg._id}
                              className={cn("flex", isAdmin ? "justify-end" : "justify-start", "group")}
                            >
                              <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
                                {!isAdmin && (
                                  <Avatar className="w-8 h-8 mb-1 ring-2 ring-background shadow-sm flex-shrink-0">
                                    <AvatarImage src={msg.senderImage || undefined} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                      {msg.senderName?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div className="flex flex-col items-start min-w-0">
                                  {!isAdmin && (
                                    <span className="text-xs text-muted-foreground mb-1 ml-1">{msg.senderName}</span>
                                  )}
                                  <div
                                    className={cn(
                                      "rounded-2xl px-3 md:px-4 py-2 md:py-2.5 shadow-sm transition-all break-words",
                                      isAdmin
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card text-foreground border"
                                    )}
                                  >
                                    <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <p
                                        className={cn(
                                          "text-xs",
                                          isAdmin ? "text-primary-foreground/80" : "text-muted-foreground"
                                        )}
                                      >
                                        {formatDistanceToNow(msg._creationTime, { addSuffix: true })}
                                      </p>
                                      {isAdmin && (
                                        <CheckCheck className={cn(
                                          "w-3 h-3",
                                          msg.isRead ? "text-primary-foreground/80" : "text-primary-foreground/60"
                                        )} />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
                                      onClick={() => handleReply(msg)}
                                    >
                                      <Reply className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                {isAdmin && (
                                  <Avatar className="w-8 h-8 mb-1 ring-2 ring-background shadow-sm flex-shrink-0">
                                    <AvatarFallback className="bg-primary/80 text-primary-foreground text-xs">
                                      A
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-lg font-medium">No messages yet</p>
                      <p className="text-sm mt-2">Start the conversation!</p>
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Reply Preview */}
              {replyingTo && (
                <div className="px-6 py-2 bg-primary/10 border-t border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Reply className="w-4 h-4" />
                    <span className="truncate max-w-md">Replying to: {replyingTo.content}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setReplyingTo(null)}
                    className="h-6 w-6"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Quick Replies */}
              {!replyingTo && (
                <div className="px-6 py-2 border-t">
                  <div className="flex flex-wrap gap-2 overflow-x-none pb-2">
                    {QUICK_REPLIES.map((reply) => (
                      <Button
                        key={reply}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                        className="whitespace-nowrap text-xs"
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 md:p-4 border-t bg-card shadow-sm">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                  <div className="flex gap-2 items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="hover:bg-muted h-10 w-10 flex-shrink-0"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 relative min-w-0">
                      <Input
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="pr-12 h-10"
                        ref={inputRef}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-muted flex-shrink-0"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smile className="w-5 h-5" />
                      </Button>
                    </div>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 h-10 px-4 md:px-6 flex-shrink-0">
                      <Send className="w-4 h-4 mr-2" />
                      <span className="hidden md:inline">Send</span>
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/50 to-background overflow-hidden">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                  <Inbox className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Inbox</h3>
                <p className="text-muted-foreground">Select a conversation to start chatting</p>
                <div className="mt-6 flex gap-3 justify-center">
                  <Button variant="outline" className="gap-2" onClick={() => setShowNewChat(true)}>
                    <Plus className="w-4 h-4" />
                    Start New Chat
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Chat Dialog */}
        <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Start New Conversation</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[400px]">
              {regularUsers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm">No users available</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {regularUsers.map((user: any) => (
                    <button
                      key={user._id}
                      onClick={() => handleStartChat(user._id)}
                      className="w-full p-3 rounded-xl transition-all text-left flex items-center gap-3 hover:bg-muted border-2 border-transparent"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email || "No email"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </Authenticated>
  );
}
