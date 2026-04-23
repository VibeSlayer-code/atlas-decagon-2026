"use client";
import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text"
import ChatGPTLogo from "@/assets/chatgpt.svg"
import GeminiLogo from "@/assets/gemini.svg"
import GroqLogo from "@/assets/groq.svg"
import { StudyBuddyWorkspace, type StudyBuddyArtifact, type StudyBuddyMessage } from "@/components/ui/study-buddy-workspace"
import {
  ImageIcon,
  MonitorIcon,
  Paperclip,
  SendIcon,
  XIcon,
  LoaderIcon,
  Sparkles,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import { useSettings } from "@/lib/settings-context";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);
  return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {showRing && isFocused && (
          <motion.span
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
        {props.onChange && (
          <div
            className="absolute bottom-2 right-2 opacity-0 w-2 h-2 bg-violet-500 rounded-full"
            style={{
              animation: 'none',
            }}
            id="textarea-ripple"
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export function AgentChat({ userName = "Vihaan" }: { userName?: string }) {
  const groqKey = (import.meta as any).env?.VITE_GROQ_API_KEY as string | undefined;
  const openaiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined;
  const geminiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const settings = useSettings();
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  const model = (settings.activeAgent as "chatgpt" | "groq" | "gemini") || "groq";
  const setModel = (m: "chatgpt" | "groq" | "gemini") => settings.setActiveAgent?.(m);

  const [showModelMenu, setShowModelMenu] = useState(false);

  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [workspaceMessages, setWorkspaceMessages] = useState<StudyBuddyMessage[]>([]);
  const [artifacts, setArtifacts] = useState<StudyBuddyArtifact[]>([]);
  const [composerValue, setComposerValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [contextPreview, setContextPreview] = useState("");
  const commandSuggestions: CommandSuggestion[] = [
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: "Notes",
      description: "Generate detailed notes",
      prefix: "/notes"
    },
    {
      icon: <ImageIcon className="w-4 h-4" />,
      label: "Flashcards",
      description: "Generate study flashcards",
      prefix: "/flashcards"
    },
    {
      icon: <MonitorIcon className="w-4 h-4" />,
      label: "Quiz",
      description: "Create an interactive quiz",
      prefix: "/quiz"
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: "Mindmap",
      description: "Build a concept mindmap",
      prefix: "/mindmap"
    },
  ];
  const rotatingPrompts = [
    "Make notes for the Polynomials chapter",
    "Make flashcards for Algebra (key formulas + examples)",
    "Explain quadratic equations like I’m 12",
    "Generate 10 practice questions with answers",
    "Summarize this page into a study plan",
  ];
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    if (value.startsWith('/') && !value.includes(' ')) {
      setShowCommandPalette(true);
      const matchingSuggestionIndex = commandSuggestions.findIndex(
        (cmd) => cmd.prefix.startsWith(value)
      );
      if (matchingSuggestionIndex >= 0) {
        setActiveSuggestion(matchingSuggestionIndex);
      } else {
        setActiveSuggestion(-1);
      }
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setPromptIndex((i) => (i + 1) % rotatingPrompts.length);
    }, 3500);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (!showModelMenu) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        modelMenuRef.current &&
        !modelMenuRef.current.contains(target) &&
        !modelButtonRef.current?.contains(target)
      ) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showModelMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const commandButton = document.querySelector('[data-command-button]');
      if (commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !commandButton?.contains(target)) {
        setShowCommandPalette(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion(prev =>
          prev < commandSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion(prev =>
          prev > 0 ? prev - 1 : commandSuggestions.length - 1
        );
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion];
          setValue(selectedCommand.prefix + ' ');
          setShowCommandPalette(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleSendMessage();
      }
    }
  };

  const handleSendMessage = () => {
    const prompt = value.trim();
    if (!prompt) return;
    setValue("");
    adjustHeight(true);

    setWorkspaceOpen(true);
    setComposerValue("");
    const userMsg: StudyBuddyMessage = { id: crypto.randomUUID(), role: "user", text: prompt };
    setWorkspaceMessages((prev) => [...prev, userMsg]);
    void runStudyBuddy(prompt);
  };

  const runStudyBuddy = async (prompt: string) => {
    setBusy(true);
    setStatus("Planning");

    const tool = inferTool(prompt);
    const assistantId = crypto.randomUUID();
    setWorkspaceMessages((prev) => [...prev, { id: assistantId, role: "assistant", text: "" }]);

    const s1 = window.setTimeout(() => setStatus(toolStatus(tool)), 450);
    const s2 = window.setTimeout(() => setStatus("Thinking"), 1200);

    try {
      const system = buildSystemPrompt();
      const contextWindow = await buildContextWindow(prompt, attachments, workspaceMessages);
      setContextPreview(contextWindow.preview);
      await new Promise((r) => window.setTimeout(r, 650));

      let content: string | undefined;

      if (model === "groq") {
        if (!groqKey) {
          throw new Error("Missing VITE_GROQ_API_KEY. Add it to .env and restart the dev server.");
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
            max_tokens: 3500,
            messages: [
              { role: "system", content: system },
              { role: "user", content: `${prompt}${contextWindow.contextBlock ? `\n\nContext:\n${contextWindow.contextBlock}` : ""}` },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(`Groq error (${response.status}): ${text || response.statusText}`);
        }

        const data = await response.json();
        content = data?.choices?.[0]?.message?.content as string | undefined;
      } else if (model === "chatgpt") {
        if (!openaiKey) {
          throw new Error("Missing VITE_OPENAI_API_KEY. Add it to .env and restart the dev server.");
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.3,
            max_tokens: 3500,
            messages: [
              { role: "system", content: system },
              { role: "user", content: `${prompt}${contextWindow.contextBlock ? `\n\nContext:\n${contextWindow.contextBlock}` : ""}` },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(`OpenAI error (${response.status}): ${text || response.statusText}`);
        }

        const data = await response.json();
        content = data?.choices?.[0]?.message?.content as string | undefined;
      } else if (model === "gemini") {
        if (!geminiKey) {
          throw new Error("Missing VITE_GEMINI_API_KEY. Add it to .env and restart the dev server.");
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${system}\n\nUser: ${prompt}${contextWindow.contextBlock ? `\n\nContext:\n${contextWindow.contextBlock}` : ""}\n\nRespond with valid JSON only.`
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 3500,
              responseMimeType: "application/json",
            },
          }),
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(`Gemini error (${response.status}): ${text || response.statusText}`);
        }

        const data = await response.json();
        content = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
      }

      if (!content) throw new Error("Empty response from model.");

      const parsed = safeJsonParse(content);
      const assistantText = typeof parsed?.assistantText === "string" ? parsed.assistantText : content;
      const artifact = toArtifact(parsed, tool, prompt);

      if (artifact) setArtifacts((prev) => [...prev, artifact]);
      await typeIntoMessage(assistantId, assistantText);
      setStatus("Done");
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : "Unknown error";
      await typeIntoMessage(assistantId, `Error: ${msg}`);
      setStatus("Error");
    } finally {
      window.clearTimeout(s1);
      window.clearTimeout(s2);
      setBusy(false);
    }
  };

  const typeIntoMessage = async (messageId: string, fullText: string) => {
    setIsTyping(true);
    const chunk = 2;
    for (let i = 0; i <= fullText.length; i += chunk) {
      const next = fullText.slice(0, i);
      setWorkspaceMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, text: next } : m))
      );
      await new Promise((r) => window.setTimeout(r, 14));
    }
    setIsTyping(false);
  };

  const sendFromWorkspace = () => {
    const prompt = composerValue.trim();
    if (!prompt || busy) return;
    setComposerValue("");
    const userMsg: StudyBuddyMessage = { id: crypto.randomUUID(), role: "user", text: prompt };
    setWorkspaceMessages((prev) => [...prev, userMsg]);
    void runStudyBuddy(prompt);
  };

  const handleQuickPrompt = (prompt: string) => {
    if (busy) return;
    const userMsg: StudyBuddyMessage = { id: crypto.randomUUID(), role: "user", text: prompt };
    setWorkspaceMessages((prev) => [...prev, userMsg]);
    void runStudyBuddy(prompt);
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAttachments((prev) => [...prev, ...Array.from(files)]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const selectCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index];
    setValue(selectedCommand.prefix + ' ');
    setShowCommandPalette(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-col w-full bg-transparent text-white relative overflow-hidden",
          workspaceOpen ? "items-stretch justify-start p-0 h-[100dvh]" : "min-h-screen items-center justify-center p-6"
        )}
      >
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
          <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
        </div>
        <div className={cn("w-full mx-auto relative", workspaceOpen ? "max-w-none flex-1 flex flex-col min-h-0" : "max-w-3xl")}>
          <input
            id="agent-chat-file"
            type="file"
            className="hidden"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          {!workspaceOpen && (
            <motion.div
              className="relative z-10 flex flex-col items-center space-y-10"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-full text-center flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex flex-col items-center mb-6"
                >
                  <BlurredStagger
                    text={`Good to see you, ${userName}`}
                    className="text-4xl md:text-5xl font-semibold tracking-tight text-white/95 pb-2"
                  />
                  <motion.div
                    className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-3/4 mt-2"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "75%", opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  />
                </motion.div>
              </div>

              <motion.div
                className="w-full relative z-20 rounded-[28px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:border-white/[0.12] transition-colors duration-300"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {/* --- REDESIGNED COMMAND PALETTE (Sleek Glassmorphism, Opaque Background) --- */}
                <AnimatePresence>
                  {showCommandPalette && (
                    <motion.div
                      ref={commandPaletteRef}
                      className="absolute left-0 right-0 bottom-[calc(100%+16px)] backdrop-blur-xl bg-[#0a0a0f]/95 rounded-[28px] z-[60] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] overflow-hidden p-2 flex flex-col gap-0.5"
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {commandSuggestions.map((suggestion, index) => {
                        const isActive = activeSuggestion === index;
                        return (
                          <motion.div
                            key={suggestion.prefix}
                            className={cn(
                              "flex items-center justify-between px-4 py-3 rounded-[20px] cursor-pointer transition-all duration-200 group",
                              isActive
                                ? "bg-white/[0.08]"
                                : "hover:bg-white/[0.04]"
                            )}
                            onMouseEnter={() => setActiveSuggestion(index)}
                            onClick={() => selectCommandSuggestion(index)}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={cn(
                                "flex items-center justify-center transition-colors",
                                isActive ? "text-white" : "text-white/40 group-hover:text-white/60"
                              )}>
                                {suggestion.icon}
                              </div>
                              <div className="flex flex-col">
                                <span className={cn(
                                  "font-medium text-sm transition-colors",
                                  isActive ? "text-white" : "text-white/80 group-hover:text-white"
                                )}>
                                  {suggestion.label}
                                </span>
                                <span className="text-[11px] text-white/40">
                                  {suggestion.description}
                                </span>
                              </div>
                            </div>
                            <div className={cn(
                              "text-[10px] font-medium tracking-wide px-3 py-1.5 rounded-xl transition-colors",
                              isActive
                                ? "bg-white/[0.1] text-white/90"
                                : "bg-white/[0.05] text-white/40 group-hover:text-white/60"
                            )}>
                              {suggestion.prefix}
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* ---------------------------------- */}

                <div className="p-4">
                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        adjustHeight();
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder=""
                      containerClassName="w-full"
                      className={cn(
                        "w-full px-6 py-5",
                        "resize-none",
                        "bg-transparent",
                        "border-none",
                        "text-white/90 text-base md:text-lg leading-relaxed",
                        "focus:outline-none",
                        "placeholder:text-white/30",
                        "min-h-[80px]"
                      )}
                      style={{
                        overflow: "hidden",
                      }}
                      showRing={false}
                    />
                    <div className="pointer-events-none absolute left-6 top-5 right-6">
                      <AnimatePresence mode="wait">
                        {value.trim().length === 0 && (
                          <motion.div
                            key={promptIndex}
                            initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="text-base md:text-lg text-white/30 select-none font-medium"
                          >
                            {rotatingPrompts[promptIndex]}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <AnimatePresence>
                  {attachments.length > 0 && (
                    <motion.div
                      className="px-4 pb-3 flex gap-2 flex-wrap"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {attachments.map((file, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-2 text-xs bg-white/[0.03] py-1.5 px-3 rounded-lg text-white/70"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <span className="max-w-[280px] truncate">{file.name}</span>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="text-white/40 hover:text-white transition-colors"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <motion.label
                      htmlFor="agent-chat-file"
                      whileTap={{ scale: 0.9 }}
                      className="p-2.5 text-white/40 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer flex items-center justify-center"
                      title="Attach files"
                    >
                      <Paperclip className="w-5 h-5" />
                    </motion.label>
                    <motion.button
                      ref={modelButtonRef}
                      type="button"
                      onClick={() => setShowModelMenu((s) => !s)}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 font-medium text-sm",
                        "text-white/50 hover:text-white hover:bg-white/[0.06]"
                      )}
                      title="Select model"
                    >
                      <div className="flex items-center gap-2">
                        <ModelLogo model={model} />
                        <ChevronDownMini />
                      </div>
                    </motion.button>
                    <motion.button
                      type="button"
                      data-command-button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCommandPalette(prev => !prev);
                      }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "p-2.5 text-white/40 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all flex items-center justify-center",
                        showCommandPalette && "bg-white/[0.08] text-white"
                      )}
                    >
                      <Command className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {showModelMenu && (
                      <motion.div
                        ref={modelMenuRef}
                        className="absolute left-4 bottom-[72px] w-56 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden z-[60]"
                        initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 6, filter: "blur(6px)" }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <ModelMenuItem
                          active={model === "chatgpt"}
                          onClick={() => { setModel("chatgpt"); setShowModelMenu(false); }}
                          model="chatgpt"
                        />
                        <ModelMenuItem
                          active={model === "groq"}
                          onClick={() => { setModel("groq"); setShowModelMenu(false); }}
                          model="groq"
                        />
                        <ModelMenuItem
                          active={model === "gemini"}
                          onClick={() => { setModel("gemini"); setShowModelMenu(false); }}
                          model="gemini"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.button
                    type="button"
                    onClick={handleSendMessage}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isTyping || !value.trim()}
                    className={cn(
                      "p-3 rounded-xl transition-all duration-200 flex items-center justify-center min-w-[48px] min-h-[48px]",
                      value.trim()
                        ? "bg-gradient-to-r from-[#7209B7] to-[#F72585] text-white shadow-[0_4px_14px_rgba(247,37,133,0.4)] hover:shadow-[0_6px_20px_rgba(247,37,133,0.6)]"
                        : "bg-white/[0.06] text-white/30 cursor-not-allowed"
                    )}
                  >
                    {isTyping ? (
                      <LoaderIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <SendIcon className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mt-4">
                {commandSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion.prefix}
                    onClick={() => selectCommandSuggestion(index)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] rounded-full text-sm text-white/70 hover:text-white transition-colors border border-white/[0.04] hover:border-white/[0.1]"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                  >
                    <span className="text-white/40 group-hover:text-white/60 transition-colors">{suggestion.icon}</span>
                    <span className="font-medium tracking-wide text-xs">{suggestion.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          {workspaceOpen && (
            <StudyBuddyWorkspace
              modelLabel={modelLabel(model)}
              status={status}
              messages={workspaceMessages}
              artifacts={artifacts}
              setArtifacts={setArtifacts}
              composerValue={composerValue}
              setComposerValue={setComposerValue}
              onSend={sendFromWorkspace}
              isBusy={busy}
              onBack={() => setWorkspaceOpen(false)}
              attachments={attachments}
              onAttachFiles={handleFilesSelected}
              onRemoveAttachment={removeAttachment}
              contextPreview={contextPreview}
              onQuickPrompt={handleQuickPrompt}
            />
          )}
        </div>
        <AnimatePresence>
          {isTyping && !workspaceOpen && (
            <motion.div
              className="fixed bottom-8 mx-auto transform -translate-x-1/2 backdrop-blur-2xl bg-white/[0.02] rounded-full px-4 py-2 shadow-lg border border-white/[0.05]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-7 rounded-full bg-white/[0.05] flex items-center justify-center text-center">
                  <span className="text-xs font-medium text-white/90 mb-0.5">agent</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <span>Thinking</span>
                  <TypingDots />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.1, 0.85]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)"
          }}
        />
      ))}
    </div>
  );
}

const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = rippleKeyframes;
  document.head.appendChild(style);
}

function modelLabel(model: "chatgpt" | "groq" | "gemini") {
  if (model === "chatgpt") return "ChatGPT";
  if (model === "groq") return "Groq";
  return "Gemini";
}

function inferTool(prompt: string): "notes" | "flashcards" | "quiz" | "summary" | "tasks" | "plan" | "mindmap" {
  const p = prompt.toLowerCase();
  if (p.includes("flashcard")) return "flashcards";
  if (p.includes("quiz") || p.includes("mcq") || p.includes("questions")) return "quiz";
  if (p.includes("summary") || p.includes("summar")) return "summary";
  if (p.includes("task")) return "tasks";
  if (p.includes("plan") || p.includes("syllabus")) return "plan";
  if (p.includes("mindmap") || p.includes("map")) return "mindmap";
  return "notes";
}

function toolStatus(tool: "notes" | "flashcards" | "quiz" | "summary" | "tasks" | "plan" | "mindmap") {
  if (tool === "flashcards") return "Generating flashcards";
  if (tool === "quiz") return "Writing quiz";
  if (tool === "summary") return "Summarizing";
  if (tool === "tasks") return "Creating task list";
  if (tool === "plan") return "Building study plan";
  if (tool === "mindmap") return "Drawing mindmap";
  return "Making notes";
}

function buildSystemPrompt() {
  return `You are Atlas Study Buddy. Return ONLY valid JSON.

Schema: { "assistantText": "string", "artifact": { "kind": "notes|flashcards|quiz|summary|tasks|plan|mindmap", "title": "string", "content": {...} } }

CRITICAL: Only create artifacts when the user EXPLICITLY asks to create study materials using keywords like:
- "make notes" / "create notes" / "generate notes"
- "make flashcards" / "create flashcards"
- "make quiz" / "create quiz" / "generate quiz"
- "make plan" / "create plan" / "study plan"
- "make mindmap" / "create mindmap" / "build mindmap"
- "summarize" / "make summary"

For ALL other messages (greetings, questions, explanations, casual conversation), respond ONLY with assistantText and NO artifact.

Examples of messages that should NOT create artifacts:
- "hi" / "hello" / "how are you"
- "what is X?" / "explain X" / "tell me about X"
- "are polynomials hard?"
- "can you help me?"
- "thanks" / "thank you"

For these, respond like:
{
  "assistantText": "Your conversational response here"
}

Only when explicitly asked to create study materials:
{
  "assistantText": "I've created notes for you!",
  "artifact": { ... }
}

For notes/summary/tasks/plan/mindmap: content = { "markdown": "string with \\n for newlines" }
For flashcards: content = { "cards":[{ "front": "string", "back": "string" }] }
For quiz: content = { "questions":[{ "q": "string", "options":["A","B","C","D"], "answer": "A", "explanation": "string" }] }

DO NOT USE EMOJIS. Use plain text only.

For mindmap, content.markdown MUST be a single string with \\n characters, NOT nested objects.

For notes/plans, use rich markdown WITHOUT emojis:
# Title
## Overview
Text here
## Core Concepts
- **Concept**: Definition
## Examples
> Example here
## Summary
| Term | Definition |
|------|------------|
| X | Y |

assistantText: short friendly message.`;
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toArtifact(
  parsed: any,
  inferredKind: "notes" | "flashcards" | "quiz" | "summary" | "tasks" | "plan" | "mindmap",
  prompt: string
): StudyBuddyArtifact | null {
  const a = parsed?.artifact;
  const kind = (a?.kind as any) ?? inferredKind;
  const title = typeof a?.title === "string" ? a.title : defaultTitle(kind, prompt);
  const content = a?.content;

  if (kind === "flashcards" && Array.isArray(content?.cards)) {
    return { kind, title, content: { cards: content.cards } };
  }
  if (kind === "quiz" && Array.isArray(content?.questions)) {
    return { kind, title, content: { questions: content.questions } };
  }
  if ((kind === "notes" || kind === "summary" || kind === "tasks" || kind === "plan" || kind === "mindmap") && typeof content?.markdown === "string") {
    return { kind, title, content: { markdown: content.markdown } };
  }

  if (typeof parsed?.assistantText === "string") {
    return { kind: inferredKind, title: defaultTitle(inferredKind, prompt), content: { markdown: parsed.assistantText } };
  }
  return null;
}

function defaultTitle(kind: string, prompt: string) {
  const base =
    kind === "flashcards" ? "Flashcards" : kind === "quiz" ? "Summary" : kind === "summary" ? "Summary" : kind === "tasks" ? "Tasks" : kind === "plan" ? "Study Plan" : kind === "mindmap" ? "Mindmap" : "Notes";
  return `${base}: ${prompt.slice(0, 48)}${prompt.length > 48 ? "…" : ""}`;
}

async function buildContextWindow(prompt: string, attachments: File[], messages: StudyBuddyMessage[]) {
  const recent = messages.slice(-3).map((m) => `${m.role}: ${m.text.slice(0, 100)}`).join("\n");
  const files = attachments.slice(0, 2);

  const fileSnippets: string[] = [];
  for (const file of files) {
    console.log(`Reading file: ${file.name}, type: ${file.type}, size: ${file.size}`);
    const text = await readFileAsText(file);
    console.log(`Extracted text length: ${text.length}`);
    if (text && !text.startsWith('[')) {
      fileSnippets.push(`File: ${file.name}\n${text.slice(0, 3000)}`);
    } else if (text) {
      console.warn(`Failed to read file: ${text}`);
      fileSnippets.push(text);
    }
  }

  const contextBlock = [
    fileSnippets.length ? `${fileSnippets.join("\n\n")}` : "",
    recent ? `\nRecent conversation:\n${recent}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const preview = contextBlock
    ? contextBlock.slice(0, 400)
    : `Prompt: ${prompt.slice(0, 150)}`

  console.log(`Context block length: ${contextBlock.length}`);
  return { contextBlock, preview }
}

async function readFileAsText(file: File) {
  try {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      try {
        console.log(`Starting PDF extraction for: ${file.name}`);
        const pdfjsLib = await import('pdfjs-dist');

        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
          useWorkerFetch: false,
          isEvalSupported: false,
        }).promise;

        console.log(`PDF loaded. Total pages: ${pdf.numPages}`);

        let fullText = '';
        const maxPages = Math.min(pdf.numPages, 15);

        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += `\n--- Page ${i} ---\n${pageText}`;
        }

        console.log(`Extracted ${fullText.length} characters from PDF`);

        const cleaned = fullText.replace(/\s+/g, " ").trim();
        const result = cleaned.slice(0, 12000);
        console.log(`Returning ${result.length} characters`);
        return result;
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return `[PDF file: ${file.name} - Unable to extract text. Error: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}. Try using a text file instead.]`;
      }
    }

    if (file.type.startsWith("image/")) {
      return `[Image file: ${file.name} - Image analysis not yet supported. Please describe the image content in your message.]`;
    }

    const raw = await file.text();
    const cleaned = raw.replace(/\s+/g, " ").trim();
    return cleaned.slice(0, 12000);
  } catch (err) {
    console.error("Error reading file:", err);
    return `[Unable to read file: ${file.name}. Error: ${err instanceof Error ? err.message : 'Unknown error'}]`;
  }
}

function ChevronDownMini() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-60">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ModelLogo({ model }: { model: "chatgpt" | "groq" | "gemini" }) {
  const src = model === "chatgpt" ? ChatGPTLogo : model === "groq" ? GroqLogo : GeminiLogo;
  return (
    <img
      src={src}
      alt={modelLabel(model)}
      className={cn(
        "h-5 w-5 opacity-90",
        (model === "chatgpt" || model === "groq") && "[filter:brightness(0)_invert(1)]"
      )}
    />
  );
}

function ModelMenuItem({
  model,
  active,
  onClick,
}: {
  model: "chatgpt" | "groq" | "gemini";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full px-3 py-2.5 flex items-center gap-2 text-left text-xs transition-colors",
        active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
      )}
    >
      <ModelLogo model={model} />
      <div className="flex flex-col">
        <span className="font-medium">{modelLabel(model)}</span>
        <span className="text-[11px] text-white/40">
          {model === "chatgpt" ? "Balanced reasoning" : model === "groq" ? "Fast responses" : "Multimodal capable"}
        </span>
      </div>
    </button>
  );
}