"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { Bot, Send, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
}

export default function SupportPage() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetchApi("/support/ask", {
        method: "POST",
        body: { prompt: userMessage.content },
      });

      if (res.success && res.data?.answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: res.data.answer,
          },
        ]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "ai",
          content: err.message === "Too many requests to the AI Support bot, please try again after a minute" 
            ? "⚠️ Rate limit reached. I need a short cooldown, please try asking again in a minute."
            : "❌ I encountered a system error trying to process your request. Please ensure you are logged in and your connection is stable.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null; // Simple protection, middleware guards backend anyway

  return (
    <div className="min-h-screen pt-[120px] pb-12 px-4 flex justify-center bg-background">
      <div className="w-full max-w-3xl h-[75vh] flex flex-col bg-card backdrop-blur-3xl rounded-3xl border border-foreground/5 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-foreground/5 flex items-center gap-4 bg-background/50">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-foreground">A.I. Support Assistant</h1>
            <p className="text-sm text-muted-foreground">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>

        {/* Message Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6">
                 <Bot size={40} className="text-cyan-500/80" />
              </div>
              <h2 className="text-2xl font-bold font-display text-foreground mb-2">How can AI assist you?</h2>
              <p className="text-muted-foreground text-sm">Describe your issue below. I can help you navigate the platform, reset your password, or find specific tool categories.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full shrink-0 flex items-center justify-center border",
                  msg.role === "ai" 
                    ? "bg-background border-cyan-500/30 text-cyan-500 mt-1" 
                    : "bg-background border-primary/30 text-primary mt-1"
                )}>
                  {msg.role === "ai" ? <Bot size={16} /> : <UserIcon size={16} />}
                </div>
                
                <div className={cn(
                  "px-5 py-3 rounded-2xl max-w-[80%] text-[14px] leading-relaxed shadow-sm",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-cyan-500/10 border border-cyan-500/20 text-foreground rounded-tl-none whitespace-pre-wrap"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-4 animate-pulse">
               <div className="w-8 h-8 rounded-full bg-background border border-cyan-500/30 text-cyan-500 mt-1 flex items-center justify-center">
                  <Bot size={16} />
               </div>
               <div className="px-5 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-foreground rounded-tl-none flex gap-1 items-center h-[46px]">
                 <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                 <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                 <div className="w-2 h-2 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: "300ms" }} />
               </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 bg-background/50 border-t border-foreground/5 flex gap-3">
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-background border border-foreground/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-foreground transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white hover:bg-cyan-600 transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-cyan-500/20"
          >
            <Send className="w-5 h-5 -ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
