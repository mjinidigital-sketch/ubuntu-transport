"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";

export default function ChatPage() {
    const [message, setMessage] = useState("");
    const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
    const [adminId, setAdminId] = useState<Id<"users"> | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const currentUser = useQuery(api.users.viewer, {});
    const admin = useQuery(api.chat.findAdmin, {});
    const getOrCreateAdminConversation = useMutation(api.chat.getOrCreateAdminConversation);
    const messages = useQuery(api.chat.listMessages, conversationId ? { conversationId } : "skip");
    const sendMessage = useMutation(api.chat.sendMessage);
    const markAsRead = useMutation(api.chat.markAsRead);

    // Get or create conversation on mount
    useEffect(() => {
        if (!conversationId && admin) {
            getOrCreateAdminConversation().then((result) => {
                if (result) {
                    setConversationId(result.conversationId);
                    setAdminId(result.adminId);
                }
            });
        }
    }, [conversationId, admin, getOrCreateAdminConversation]);

    // Mark as read when conversation loads
    useEffect(() => {
        if (conversationId) {
            markAsRead({ conversationId });
        }
    }, [conversationId, markAsRead]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !adminId) {
            console.error("Admin ID not found");
            return;
        }

        try {
            await sendMessage({ 
                receiverId: adminId,
                content: message.trim(),
            });
            setMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    if (!admin) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <Card className="h-[calc(100vh-8rem)] flex items-center justify-center">
                    <CardContent>
                        <p className="text-muted-foreground">No admin available to chat with.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Card className="h-[calc(100vh-8rem)] flex flex-col">
                <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        Support Chat
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                    <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages?.map((msg: any) => {
                                const isAdmin = msg.senderId === currentUser?._id;
                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex gap-3 ${
                                            isAdmin ? "justify-start" : "justify-end"
                                        }`}
                                    >
                                        <div
                                            className={`flex gap-3 max-w-[80%] ${
                                                isAdmin ? "flex-row" : "flex-row-reverse"
                                            }`}
                                        >
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    isAdmin
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-secondary text-secondary-foreground"
                                                }`}
                                            >
                                                {isAdmin ? (
                                                    <Bot className="w-4 h-4" />
                                                ) : (
                                                    <User className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div
                                                className={`rounded-lg p-3 ${
                                                    isAdmin
                                                        ? "bg-muted"
                                                        : "bg-primary text-primary-foreground"
                                                }`}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                                <p
                                                    className={`text-xs mt-1 ${
                                                        isAdmin
                                                            ? "text-muted-foreground"
                                                            : "text-primary-foreground/70"
                                                    }`}
                                                >
                                                    {formatTime(msg._creationTime)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!messages || messages.length === 0) && (
                                <div className="text-center text-muted-foreground py-8">
                                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No messages yet. Start a conversation!</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t">
                        <div className="flex gap-2">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1"
                            />
                            <Button type="submit" size="icon">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
