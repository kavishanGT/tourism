"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Trash2,
  SlidersHorizontal,
  Compass,
  Database,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { askAiAssistant, AiChatResponseData } from "@/lib/api/ai";
import { CitationCard } from "./citation-card";
import { AgentActionCard } from "./agent-action-card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  data?: AiChatResponseData;
  timestamp: Date;
}

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  "⚡ Plan a 3-day beach and heritage trip to Galle and Mirissa",
  "✨ Recommend activities based on my saved favorites",
  "🗺️ What should I do next on my planned trip?",
  "What is the entry fee and opening hours for Sigiriya Fortress?",
  "What are the official Sri Lanka tourism guidelines and regulations?",
];

export function AiChatDrawer({ isOpen, onClose }: AiChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Ayubowan! 👋 I am your Sri Lanka Tourism AI Assistant. I can answer questions using live platform database records (destinations, attractions, pricing, opening hours) and official document guides.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retrievalMode, setRetrievalMode] = useState<
    "auto" | "hybrid_db" | "hybrid_rerank" | "dense"
  >("auto");
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput("");
    setIsLoading(true);

    try {
      const responseData = await askAiAssistant({
        query: text,
        retrievalMode,
        topK: 5,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: responseData.answer,
        data: responseData,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("AI Assistant request failed:", error);
      const serverMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: serverMsg
          ? `Sorry, I ran into an issue: ${serverMsg}`
          : "Sorry, I ran into an issue connecting to the AI Assistant server. Please check your network or try again shortly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        text: "Chat history cleared. How can I help with your Sri Lanka journey today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div className="flex h-full w-full max-w-lg flex-col bg-slate-950 border-l border-emerald-500/20 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 bg-slate-900/80 px-4 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Sri Lanka Tourism AI
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <p className="text-[11px] text-emerald-400/80">
                Hybrid RAG & Live PostgreSQL Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`rounded-lg p-2 transition-colors ${showSettings
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              title="Retrieval Settings"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              onClick={handleClearHistory}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Close Drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Settings Bar */}
        {showSettings && (
          <div className="border-b border-emerald-500/20 bg-slate-900/90 px-4 py-2.5 text-xs text-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-400">Retrieval Strategy:</span>
              <select
                value={retrievalMode}
                onChange={(e) => setRetrievalMode(e.target.value as any)}
                className="rounded border border-emerald-500/30 bg-slate-950 px-2 py-1 text-xs text-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="auto">⚡ Auto Router (Recommended)</option>
                <option value="hybrid_db">🗄️ Hybrid Live DB + Vector</option>
                <option value="hybrid_rerank">📚 Cross-Encoder Rerank</option>
                <option value="dense">🔍 Dense Semantic Search</option>
              </select>
            </div>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm break-words overflow-hidden ${msg.role === "user"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none"
                    : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none"
                    }`}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="space-y-2 text-slate-200 text-xs leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1 className="text-sm font-bold text-emerald-300 mt-2 mb-1.5" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="text-xs font-bold text-emerald-300 mt-2 mb-1" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-xs font-semibold text-emerald-400 mt-2 mb-1" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="leading-relaxed mb-2 last:mb-0" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-4 space-y-1 my-2 text-slate-300" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-4 space-y-1 my-2 text-slate-300" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="leading-relaxed pl-0.5" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-semibold text-emerald-300" {...props} />
                          ),
                          em: ({ node, ...props }) => (
                            <em className="italic text-slate-300" {...props} />
                          ),
                          code: ({ node, className, children, ...props }) => {
                            const str = String(children).trim();
                            if (str.startsWith("[DB") || str.startsWith("[S")) {
                              return (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 mx-0.5 shadow-sm">
                                  {children}
                                </span>
                              );
                            }
                            return (
                              <code className="px-1 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-emerald-200 border border-slate-700" {...props}>
                                {children}
                              </code>
                            );
                          },
                          table: ({ node, ...props }) => (
                            <div className="my-2.5 w-full overflow-x-auto rounded-lg border border-emerald-500/20 bg-slate-950/70 p-1">
                              <table className="w-full text-left text-[11px] border-collapse" {...props} />
                            </div>
                          ),
                          th: ({ node, ...props }) => (
                            <th className="border-b border-emerald-500/20 bg-slate-800/90 px-2.5 py-1.5 font-semibold text-emerald-300 whitespace-nowrap" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="border-b border-slate-800/80 px-2.5 py-1.5 text-slate-300 text-[11px]" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-2 border-emerald-500 pl-2.5 my-2 italic text-slate-400" {...props} />
                          ),
                          hr: ({ node, ...props }) => (
                            <hr className="border-slate-800 my-2" {...props} />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Intent & Citations Metadata */}
                {msg.data && (
                  <div className="space-y-2 text-[11px]">
                    {/* Agent Action Proposal Card */}
                    {msg.data.action_plan && (
                      <AgentActionCard actionPlan={msg.data.action_plan} />
                    )}

                    {/* Route Info Badge */}
                    <div className="flex flex-wrap items-center gap-2 px-1 text-emerald-400/80">
                      {msg.data.retrieval?.route && (
                        <div className="flex items-center gap-1.5">
                          <Compass className="h-3 w-3" />
                          <span>
                            Intent:{" "}
                            <strong className="text-emerald-300 capitalize">
                              {msg.data.retrieval.route.intent.replace("_", " ")}
                            </strong>
                          </span>
                        </div>
                      )}
                      {msg.data.retrieval?.has_user_context && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-300 border border-purple-500/30">
                          <User className="h-2.5 w-2.5" />
                          Personalized
                        </span>
                      )}
                    </div>

                    {/* Citations Grid */}
                    {msg.data.citations && msg.data.citations.length > 0 && (
                      <div className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-2.5 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400">
                          <span className="flex items-center gap-1">
                            <Database className="h-3 w-3" /> Source Citations (
                            {msg.data.citations.length})
                          </span>
                        </div>
                        <div className="grid gap-1.5">
                          {msg.data.citations.map((cit, i) => (
                            <CitationCard key={i} citation={cit} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <span className="block px-1 text-[10px] text-slate-500">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-900 border border-teal-500/30 text-teal-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400 animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-none bg-slate-900/90 border border-slate-800 px-4 py-3 text-xs text-emerald-400 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-bounce" />
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400 ml-1">
                  Querying database & vector documents...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40">
            <p className="text-[11px] font-semibold text-emerald-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Quick Questions:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="rounded-full border border-emerald-500/20 bg-emerald-950/30 px-2.5 py-1 text-[11px] text-emerald-200 transition-colors hover:border-emerald-500/50 hover:bg-emerald-900/40 text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Box */}
        <div className="border-t border-emerald-500/20 bg-slate-900/90 p-3 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about destinations, entry fees, experiences..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-emerald-500/20 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
