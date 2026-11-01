"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Bot,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  time: string;
  pluginName?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hey — I'm **Crafty**, your Effectcraft copilot. Ask me about plugins, render pipelines, installation, or which effect fits the shot.",
    time: "Now",
  },
];

const SUGGESTED_PROMPTS = [
  "Best glow for night scenes?",
  "How do I install a plugin?",
  "My render looks blocky",
  "Motion Blur vs Twixtor",
];

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function timeLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildReply(query: string): { content: string; pluginName?: string } {
  const normalized = query.toLowerCase();

  if (
    normalized.includes("glow") ||
    normalized.includes("bloom") ||
    normalized.includes("night")
  ) {
    return {
      pluginName: "S_Glow",
      content:
        "For night scenes, start with **S_Glow** for a soft halation and layer **S_Glint** for specular streaks. Keep the threshold high enough that only practical lights bloom, then lower the gain until the shadows stay clean.",
    };
  }

  if (normalized.includes("motion") || normalized.includes("blur")) {
    return {
      pluginName: "S_Motion Blur",
      content:
        "**S_Motion Blur** reads directional vectors between frames. If you see ghosting, match the shutter angle to your source footage and check that the clip frame rate matches the timeline before rendering.",
    };
  }

  if (normalized.includes("twixtor") || normalized.includes("slow")) {
    return {
      pluginName: "Twixtor Auto",
      content:
        "**Twixtor Auto** is the quickest starting point for retiming. For fast action, switch to **Twixtor Tracking** and enable motion-vector tracking so the optical flow follows the subject instead of the background.",
    };
  }

  if (
    normalized.includes("install") ||
    normalized.includes("download") ||
    normalized.includes("plugin")
  ) {
    return {
      content:
        "Open any plugin from **/plugins**, choose your host application, and download the matching build. Drop the bundle into your OFX or effects folder, restart the editor, then look for the Effectcraft group in your effects browser.",
    };
  }

  if (
    normalized.includes("blocky") ||
    normalized.includes("pixel") ||
    normalized.includes("quality") ||
    normalized.includes("render")
  ) {
    return {
      content:
        "Blocky output usually means the preview is rendering at a reduced resolution or the effect is sampling a low-resolution buffer. Check the preview quality menu, confirm your timeline is set to full resolution, and clear the render cache before exporting.",
    };
  }

  if (
    normalized.includes("bug") ||
    normalized.includes("crash") ||
    normalized.includes("error") ||
    normalized.includes("broken")
  ) {
    return {
      content:
        "That sounds like one for the engineering team. Head to **/support** and include your editor version, the plugin name, and the exact steps that reproduce the issue. Crash logs are especially useful.",
    };
  }

  if (
    normalized.includes("price") ||
    normalized.includes("license") ||
    normalized.includes("buy")
  ) {
    return {
      content:
        "Every plugin listing shows its license and compatibility on the detail page. If you need a studio or team license, contact **support@effectcraft.com** and we'll put together the right bundle.",
    };
  }

  return {
    content:
      "I can help you pick an effect, tune a look, or troubleshoot a render. Tell me the plugin or the problem you're seeing and I'll narrow it down. For account or billing issues, **/support** is the fastest route.",
  };
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export function AiAssistant() {
  const pathname = usePathname();
  const isLibrary = pathname.startsWith("/library");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const replyTimer = useRef<number | null>(null);

  // Allow other parts of the site to open the assistant.
  useEffect(() => {
    const openAssistant = () => setIsOpen(true);
    window.addEventListener("effectcraft:open-assistant", openAssistant);
    return () =>
      window.removeEventListener("effectcraft:open-assistant", openAssistant);
  }, []);

  // Scroll to the newest message.
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // Focus the composer when the panel opens.
  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 240);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // Escape closes the panel.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        launcherRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Clean up the mocked response timer.
  useEffect(() => {
    return () => {
      if (replyTimer.current !== null) {
        window.clearTimeout(replyTimer.current);
      }
    };
  }, []);

  function sendMessage(value?: string) {
    const text = (value ?? input).trim();
    if (!text || isTyping) return;

    setMessages((current) => [
      ...current,
      {
        id: createId(),
        role: "user",
        content: text,
        time: timeLabel(),
      },
    ]);
    setInput("");
    setIsTyping(true);

    replyTimer.current = window.setTimeout(() => {
      const reply = buildReply(text);
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: reply.content,
          time: timeLabel(),
          pluginName: reply.pluginName,
        },
      ]);
      setIsTyping(false);
      replyTimer.current = null;
    }, 950);
  }

  function resetConversation() {
    if (replyTimer.current !== null) {
      window.clearTimeout(replyTimer.current);
      replyTimer.current = null;
    }
    setMessages(INITIAL_MESSAGES);
    setInput("");
    setIsTyping(false);
  }

  function closeAssistant() {
    setIsOpen(false);
    window.requestAnimationFrame(() => launcherRef.current?.focus());
  }

  return (
    <>
      {/* Floating toggle */}
      <motion.button
        ref={launcherRef}
        type="button"
        onClick={() => (isOpen ? closeAssistant() : setIsOpen(true))}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-expanded={isOpen}
        aria-controls="effectcraft-assistant"
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        title={isOpen ? "Close AI Assistant" : "Ask Crafty"}
        className={`group fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 rounded-full border border-white/15 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-sm font-semibold text-white shadow-2xl shadow-violet-600/35 transition-shadow hover:shadow-cyan-500/30 sm:bottom-6 sm:right-6 ${
          isLibrary ? "h-12 w-12 justify-center p-0" : "px-4 py-3.5"
        }`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full bg-violet-500/25 blur-xl"
        />
        {isOpen ? (
          <>
            <X className="h-5 w-5" />
            <span className={isLibrary ? "hidden" : "hidden sm:inline"}>
              Close
            </span>
          </>
        ) : (
          <>
            <span className="relative">
              <Bot className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-cyan-300" />
              <span className="absolute -right-1 -top-1 h-2 w-2 animate-ping rounded-full bg-cyan-300" />
            </span>
            <span className={isLibrary ? "hidden" : "hidden sm:inline"}>
              Ask Crafty
            </span>
            <Sparkles
              className={
                isLibrary
                  ? "hidden"
                  : "hidden h-3.5 w-3.5 text-cyan-200 sm:block"
              }
            />
          </>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            id="effectcraft-assistant"
            role="dialog"
            aria-label="Effectcraft AI Assistant"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={{ backgroundColor: "rgba(8, 10, 16, 0.995)" }}
            className="glass-panel fixed bottom-24 right-4 z-[60] flex h-[min(600px,calc(100dvh-8rem))] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-3xl sm:right-6"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-slate-950/45 px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 p-px shadow-lg shadow-violet-500/20">
                  <div className="grid h-full w-full place-items-center rounded-[11px] bg-slate-950">
                    <Bot className="h-4 w-4 text-cyan-300" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-display text-sm font-semibold text-white">
                      Crafty
                    </h2>
                    <span className="rounded border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-200">
                      AI
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] text-slate-400">
                      Online · mocked locally
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={resetConversation}
                  aria-label="Reset conversation"
                  title="Reset conversation"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={closeAssistant}
                  aria-label="Close AI Assistant"
                  title="Close"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              className="flex-1 space-y-4 overflow-y-auto px-4 py-5"
            >
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isUser
                          ? "rounded-tr-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-950/30"
                          : "rounded-tl-md border border-white/10 bg-slate-950/55 text-slate-200"
                      }`}
                    >
                      <RichText text={message.content} />

                      {message.pluginName && (
                        <Link
                          href="/plugins"
                          className="mt-2.5 flex items-center justify-between gap-3 border-t border-white/10 pt-2 text-[11px] font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                        >
                          <span className="truncate">
                            Suggested: {message.pluginName}
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                        </Link>
                      )}
                    </div>
                    <span className="mt-1 px-1 text-[10px] text-slate-500">
                      {message.time}
                    </span>
                  </motion.div>
                );
              })}

              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/10 bg-slate-950/55 px-4 py-3">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          className="h-1.5 w-1.5 rounded-full bg-violet-300"
                          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: dot * 0.15,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">
                      Crafty is thinking…
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested prompts */}
            <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-white/5 bg-slate-950/30 px-4 py-2.5">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={isTyping}
                  className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-slate-300 transition-colors hover:border-violet-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Composer */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-slate-950/55 p-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about a plugin or render…"
                aria-label="Message Crafty"
                autoComplete="off"
                maxLength={600}
                className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/25"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-950/30 transition-all hover:from-violet-500 hover:to-cyan-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

export default AiAssistant;
