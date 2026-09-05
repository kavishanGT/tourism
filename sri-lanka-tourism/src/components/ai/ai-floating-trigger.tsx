"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { AiChatDrawer } from "./ai-chat-drawer";

export function AiFloatingTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener("open-ai-assistant", handleOpenEvent);
    return () => window.removeEventListener("open-ai-assistant", handleOpenEvent);
  }, []);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 px-4 py-3 text-white shadow-2xl shadow-emerald-600/40 transition-all hover:scale-105 hover:shadow-emerald-500/60 active:scale-95 cursor-pointer"
          aria-label="Open AI Assistant"
        >
          {/* Pulsing Outer Glow */}
          <span className="absolute -inset-0.5 rounded-full bg-emerald-400 opacity-50 blur transition-all group-hover:opacity-80 animate-pulse" />

          <div className="relative flex items-center justify-center">
            <Sparkles className="h-5 w-5 animate-bounce text-emerald-200" />
          </div>
          <span className="relative text-xs font-bold tracking-wide">
            AI Assistant
          </span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-200" />
          </span>
        </button>
      </div>

      <AiChatDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
