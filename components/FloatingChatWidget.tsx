"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Send, X, MessageCircle, Minimize2, Maximize2, Check, CheckCheck, Smile, MoreVertical, PhoneCall, MessageSquare, Mail, Globe, Lock, Phone, MessageCircle as MessageCircleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { Authenticated, Unauthenticated } from "convex/react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useAuthActions } from "@convex-dev/auth/react";

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  senderName: string;
  senderImage: string | null | undefined;
  _creationTime: number;
}

const GREETING_MESSAGES = [
  "Hi there! 👋 How can we help you today?",
  "Welcome! Our team is ready to assist you.",
  "Hello! What can we help you with?",
];

const CONTACT_OPTIONS = [
  {
    id: "chat",
    icon: MessageCircle,
    label: "Live Chat",
    description: "Chat with our support team",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "call",
    icon: PhoneCall,
    label: "Call Us",
    description: "+1 (555) 123-4567",
    action: "tel:+15551234567",
    color: "from-green-500 to-green-600",
  },
  {
    id: "whatsapp",
    icon: MessageSquare,
    label: "WhatsApp",
    description: "Message on WhatsApp",
    action: "https://wa.me/15551234567",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "email",
    icon: Mail,
    label: "Email",
    description: "support@example.com",
    action: "mailto:support@example.com",
    color: "from-purple-500 to-purple-600",
  },
];

const FLOATING_BUTTONS = [
  {
    id: "whatsapp",
    icon: MessageSquare,
    label: "WhatsApp Us",
    action: "https://wa.me/15551234567",
    color: "bg-green-500 hover:bg-green-600",
    position: "bottom-6 right-6",
  },
  {
    id: "call",
    icon: Phone,
    label: "Call Us",
    action: "tel:+15551234567",
    color: "bg-blue-500 hover:bg-blue-600",
    position: "bottom-6 right-20",
  },
  {
    id: "chat",
    icon: MessageCircleIcon,
    label: "Chat with Us",
    action: null,
    color: "bg-primary hover:bg-primary/90",
    position: "bottom-6 right-6 mt-16",
  },
];

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedContact, setSelectedContact] = useState<"chat" | "call" | "whatsapp" | "email">("chat");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const admin = useQuery(api.chat.findAdmin, {});
  const messages = useQuery(api.chat.listMessages, conversationId ? { conversationId: conversationId as any } : "skip");
  const sendMessage = useMutation(api.chat.sendMessage);
  const getOrCreateAdminConversation = useMutation(api.chat.getOrCreateAdminConversation);
  const currentUser = useQuery(api.users.viewer, {});
  const { signIn } = useAuthActions();

  // Get or create conversation on mount (only for authenticated users)
  useEffect(() => {
    if (!conversationId && admin && currentUser) {
      getOrCreateAdminConversation().then((result) => {
        if (result) {
          setConversationId(result.conversationId);
          setAdminId(result.adminId);
        }
      });
    }
  }, [conversationId, admin, currentUser, getOrCreateAdminConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !adminId) return;

    try {
      await sendMessage({
        receiverId: adminId as any,
        content: message.trim(),
      });

      setMessage("");
      setHasStartedChat(true);
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleContactOption = (option: typeof CONTACT_OPTIONS[0]) => {
    if (option.id === "chat") {
      setSelectedContact("chat");
    } else if (option.action) {
      window.open(option.action, "_blank");
    }
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

  if (!isOpen) {
    return (
      <>
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/15551234567"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-36 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 group"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute right-12 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
              WhatsApp Us
            </span>
          </div>
        </a>

        {/* Call Button */}
        <a
          href="tel:+15551234567"
          className="fixed bottom-20 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 group"
        >
          <div className="relative">
            <Phone className="w-6 h-6" />
            <span className="absolute right-12 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
              Call Us
            </span>
          </div>
        </a>

        {/* Chat Button */}
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg transition-all hover:scale-105 group"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-primary animate-pulse"></span>
            <span className="absolute right-12 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
              Chat with Us
            </span>
          </div>
        </button>
      </>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 mt-16 z-50 bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden border transition-all",
        isMinimized ? "w-64 h-12" : "w-[336px] h-[544px]"
      )}
    >
      <Authenticated>
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-primary animate-pulse"></span>
            </div>
            <div>
              <h3 className="font-semibold">Support Chat</h3>
              <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Online now
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-primary-foreground/20 p-2 rounded-lg transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleChat}
              className="hover:bg-primary-foreground/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Contact Options Bar */}
            <div className="p-3 border-b bg-muted/50">
              <div className="flex gap-2">
                {CONTACT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleContactOption(option)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:bg-background",
                      selectedContact === option.id ? "bg-background ring-2 ring-primary" : ""
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white", option.color)}>
                      <option.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-muted/50 to-background" ref={scrollRef}>
              {!hasStartedChat ? (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">How can we help you?</h4>
                    <p className="text-sm text-muted-foreground">Start a conversation with our support team</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages && messages.length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                        <div key={dateLabel}>
                          <div className="flex items-center justify-center my-3">
                            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                              {dateLabel}
                            </span>
                          </div>
                          {msgs.map((msg) => {
                            const isAdmin = msg.senderId === currentUser?._id;
                            return (
                              <div
                                key={msg._id}
                                className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                              >
                                <div className="flex items-end gap-2 max-w-[85%]">
                                  {isAdmin && (
                                    <Avatar className="w-8 h-8 mb-1 ring-2 ring-background shadow-sm">
                                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        S
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                  <div className="flex flex-col items-start">
                                    {isAdmin && (
                                      <span className="text-xs text-muted-foreground mb-1 ml-1">Support Team</span>
                                    )}
                                    <div
                                      className={cn(
                                        "rounded-2xl px-4 py-2.5 shadow-sm",
                                        isAdmin
                                          ? "bg-muted text-foreground border"
                                          : "bg-primary text-primary-foreground"
                                      )}
                                    >
                                      <p className="text-sm leading-relaxed">{msg.content}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <p
                                          className={cn(
                                            "text-xs",
                                            isAdmin ? "text-muted-foreground" : "text-primary-foreground/80"
                                          )}
                                        >
                                          {formatDistanceToNow(msg._creationTime, { addSuffix: true })}
                                        </p>
                                        {!isAdmin && msg.isRead && (
                                          <CheckCheck className="w-3 h-3 text-primary-foreground/80" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {!isAdmin && (
                                    <Avatar className="w-8 h-8 mb-1 ring-2 ring-background shadow-sm">
                                      <AvatarFallback className="bg-primary/80 text-primary-foreground text-xs">
                                        {msg.senderName?.charAt(0).toUpperCase() || "U"}
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
                    <div className="text-center text-muted-foreground py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">Start the conversation!</p>
                    </div>
                  )}
                </>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSendMessage}>
                <div className="flex gap-2 items-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted h-10 w-10"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <PhoneCall className="w-4 h-4 mr-2" />
                        Call Support
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="w-4 h-4 mr-2" />
                        Email Support
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Help Center
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="flex-1 relative">
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
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-muted"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 h-10 px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </Authenticated>

      <Unauthenticated>
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Support Chat</h3>
              <p className="text-xs text-primary-foreground/80">Login required</p>
            </div>
          </div>
          <button
            onClick={toggleChat}
            className="hover:bg-primary-foreground/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h4 className="font-semibold text-lg mb-2">Login to Chat</h4>
          <p className="text-sm text-muted-foreground mb-4">Please sign in to start a conversation with our support team.</p>
          <Button
            onClick={() => {
              toggleChat();
              signIn("password");
            }}
            className="w-full"
          >
            Sign In
          </Button>
        </div>
      </Unauthenticated>
    </div>
  );
}
