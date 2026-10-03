"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Send, X, MessageCircle, Users, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  _id: Id<"conversations">;
  participant: {
    _id: Id<"users">;
    name: string | null;
    email: string | null;
    image: string | null;
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
  senderImage: string | null;
}

export function DashboardChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUser = useQuery(api.users.viewer, {});
  const conversations = useQuery(api.chat.listConversations, {});
  const messages = useQuery(api.chat.listMessages, selectedConversationId ? { conversationId: selectedConversationId } : "skip");
  const sendMessage = useMutation(api.chat.sendMessage);
  const markAsRead = useMutation(api.chat.markAsRead);
  const unreadCount = useQuery(api.chat.getUnreadCount, {});

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversationId) return;

    const selectedConv = conversations?.find(c => c._id === selectedConversationId);
    if (!selectedConv) return;

    await sendMessage({
      receiverId: selectedConv.participant._id,
      content: message.trim(),
    });

    setMessage("");
  };

  const filteredConversations = conversations?.filter((conv) =>
    conv.participant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const selectedConversation = conversations?.find((c) => c._id === selectedConversationId);

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {unreadCount && unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Support Chat</h3>
                <p className="text-xs text-indigo-100">
                  {selectedConversation
                    ? `Chat with ${selectedConversation.participant.name}`
                    : `${conversations?.length || 0} conversations`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Conversations List */}
            {!selectedConversationId && (
              <div className="w-full flex flex-col">
                {/* Search */}
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>

                {/* Conversations */}
                <ScrollArea className="flex-1">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No conversations yet</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filteredConversations.map((conv) => (
                        <button
                          key={conv._id}
                          onClick={() => setSelectedConversationId(conv._id)}
                          className="w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={conv.participant.image || undefined} />
                            <AvatarFallback>
                              {conv.participant.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">{conv.participant.name || "Unknown"}</p>
                              {conv.lastMessageAt && (
                                <span className="text-xs text-gray-400">
                                  {formatDistanceToNow(conv.lastMessageAt, { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{conv.lastMessage || "No messages"}</p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}

            {/* Messages View */}
            {selectedConversationId && (
              <div className="w-full flex flex-col">
                {/* Back Button */}
                <div className="p-3 border-b flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversationId(null)}
                    className="p-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2 flex-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedConversation?.participant.image || undefined} />
                      <AvatarFallback>
                        {selectedConversation?.participant.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{selectedConversation?.participant.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{selectedConversation?.participant.email}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  {messages && messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((msg) => {
                        const isAdmin = msg.senderId === currentUser?._id;
                        return (
                          <div
                            key={msg._id}
                            className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                isAdmin
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isAdmin ? "text-indigo-200" : "text-gray-500"
                                }`}
                              >
                                {formatDistanceToNow(msg._creationTime, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">Start the conversation!</p>
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
